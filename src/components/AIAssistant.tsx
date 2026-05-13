import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { XIcon, SendIcon, LoaderIcon, ClockCircleIcon, PlusIcon } from './icons';
import aiAssistantIconUrl from '../assets/icons/ai-chat-icon.svg';
import { chatApi, deviceApi, alertApi, workOrderApi, buildingApi } from '../api';
import type { ChatMessage, Device, Alert, WorkOrder, WorkOrderPriority, Building } from '../types';
import { AssistantMessageBody } from './assistant/AssistantAlertReply';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'tool';
  timestamp: string;
  toolCallId?: string;
  isProcessing?: boolean;
}

/** 一次完整对话 = 一条历史（含该轮全部消息与独立标题） */
interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: Message[];
}

const STORAGE_KEY = 'ai-assistant-drawer-sessions-v1';
const MAX_SESSIONS = 40;

const AI_ICON_PANEL: CSSProperties = {
  backgroundColor: '#141414',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const TOOL_INFO: Record<string, { label: string; description: string }> = {
  query_devices: { label: '查询设备', description: '正在查询设备信息...' },
  query_alerts: { label: '查询告警', description: '正在查询告警记录...' },
  create_work_order: { label: '创建工单', description: '正在创建工单...' },
};

type DisplayItem = Message | { kind: 'paired'; tool: Message; assistant: Message };

function toDisplayItems(messages: Message[]): DisplayItem[] {
  const out: DisplayItem[] = [];
  let i = 0;
  while (i < messages.length) {
    const m = messages[i];
    const next = messages[i + 1];
    if (m.role === 'tool' && next?.role === 'assistant') {
      out.push({ kind: 'paired', tool: m, assistant: next });
      i += 2;
      continue;
    }
    out.push(m);
    i++;
  }
  return out;
}

function uiMessagesToChatHistory(msgs: Message[]): ChatMessage[] {
  return msgs
    .filter((m) => !m.isProcessing)
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
      tool_call_id: msg.toolCallId,
    }));
}

function sessionTitleFromMessages(msgs: Message[]): string {
  const firstUser = msgs.find((m) => m.role === 'user');
  if (firstUser) {
    const t = firstUser.content.replace(/\s+/g, ' ').trim();
    return t.length <= 40 ? t : `${t.slice(0, 40)}…`;
  }
  const overview = msgs.find(
    (m) => m.role === 'assistant' && m.content.startsWith('【当前监测概览】'),
  );
  if (overview) return '监测概览';
  return '新对话';
}

function patchSessionMessages(
  setSessions: Dispatch<SetStateAction<ChatSession[]>>,
  sessionId: string,
  patch: (messages: Message[]) => Message[],
) {
  setSessions((prev) =>
    prev.map((s) => {
      if (s.id !== sessionId) return s;
      const messages = patch(s.messages);
      return {
        ...s,
        messages,
        updatedAt: Date.now(),
        title: sessionTitleFromMessages(messages),
      };
    }),
  );
}

function startOfLocalDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** 按 DeepSeek 习惯：今天 / 昨天 / 7 天内 / 30 天内 / 更早 */
function groupSessionsByRecency(sessions: ChatSession[]): { label: string; items: ChatSession[] }[] {
  const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);
  const now = Date.now();
  const t0 = startOfLocalDay(new Date());
  const tYesterday = t0 - 86400000;
  const roll7 = now - 7 * 86400000;
  const roll30 = now - 30 * 86400000;

  const today: ChatSession[] = [];
  const yesterday: ChatSession[] = [];
  const in7: ChatSession[] = [];
  const in30: ChatSession[] = [];
  const older: ChatSession[] = [];

  for (const s of sorted) {
    const t = s.updatedAt;
    if (t >= t0) today.push(s);
    else if (t >= tYesterday) yesterday.push(s);
    else if (t >= roll7) in7.push(s);
    else if (t >= roll30) in30.push(s);
    else older.push(s);
  }

  const out: { label: string; items: ChatSession[] }[] = [];
  if (today.length) out.push({ label: '今天', items: today });
  if (yesterday.length) out.push({ label: '昨天', items: yesterday });
  if (in7.length) out.push({ label: '7 天内', items: in7 });
  if (in30.length) out.push({ label: '30 天内', items: in30 });
  if (older.length) out.push({ label: '更早', items: older });
  return out;
}

function readPersisted(): { sessions: ChatSession[]; activeSessionId: string | null } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { sessions?: ChatSession[]; activeSessionId?: string | null };
    if (!Array.isArray(p.sessions) || p.sessions.length === 0) return null;
    const sessions = p.sessions.map((s) => ({
      ...s,
      title: s.title || sessionTitleFromMessages(s.messages || []),
      messages: Array.isArray(s.messages) ? s.messages : [],
      updatedAt: typeof s.updatedAt === 'number' ? s.updatedAt : Date.now(),
    }));
    return { sessions, activeSessionId: p.activeSessionId ?? null };
  } catch {
    return null;
  }
}

function writePersisted(sessions: ChatSession[], activeSessionId: string | null) {
  try {
    const trimmed = sessions.slice(0, MAX_SESSIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: trimmed, activeSessionId }));
  } catch {
    /* ignore quota */
  }
}

function formatChatApiError(err: unknown): string {
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return '无法连接服务：请确认 Mock 服务已启动（如 http://localhost:3001），且前端开发代理正常。';
  }
  if (err instanceof Error) {
    const m = err.message;
    if (m && m.length < 200) {
      return `对话服务异常：${m}。请稍后重试。`;
    }
  }
  return '对话服务暂时不可用，请稍后重试。';
}

function formatToolFailure(label: string, err: unknown): string {
  if (err instanceof SyntaxError) {
    return '工具参数解析失败，请换种说法重试。';
  }
  if (err instanceof Error) {
    if (err.message.startsWith('Unknown tool:')) {
      return `当前不支持该工具：${err.message.replace('Unknown tool: ', '')}。`;
    }
    const m = err.message;
    if (m && m.length < 200) {
      return `「${label}」执行失败：${m}`;
    }
  }
  return `「${label}」执行失败，请稍后重试。`;
}

function formatOverviewFromApis(
  buildings: Building[],
  devices: Device[],
  alerts: Alert[],
  workOrders: WorkOrder[],
): string {
  const countDevice = (s: Device['status']) => devices.filter((d) => d.status === s).length;
  const countWo = (s: WorkOrder['status']) => workOrders.filter((w) => w.status === s).length;
  const unackAlerts = alerts.filter((a) => !a.acknowledged).length;
  const buildingNames = buildings.map((b) => b.name).join('、');

  return [
    '【当前监测概览】已根据接口实时汇总：',
    '',
    `· 管理楼栋：${buildings.length} 栋${buildingNames ? `（${buildingNames}）` : ''}`,
    `· 受监控设备：共 ${devices.length} 台 — 正常 ${countDevice('normal')}、告警 ${countDevice('warning')}、故障 ${countDevice('fault')}、离线 ${countDevice('offline')}`,
    `· 告警记录：共 ${alerts.length} 条（未确认 ${unackAlerts} 条）`,
    `· 维修工单：共 ${workOrders.length} 条 — 待派单 ${countWo('pending')}、已派单 ${countWo('assigned')}、处理中 ${countWo('in_progress')}、已完成 ${countWo('completed')}`,
    '',
    '你可以继续问我，例如：「B1 栋有哪些故障设备？」「有哪些未确认告警？」或说明要创建的工单。',
  ].join('\n');
}

async function fetchOverviewMessages(): Promise<Message[]> {
  const [buildings, devices, alerts, workOrders] = await Promise.all([
    buildingApi.getAll(),
    deviceApi.getAll(),
    alertApi.getAll(),
    workOrderApi.getAll(),
  ]);
  const content = formatOverviewFromApis(buildings, devices, alerts, workOrders);
  return [
    {
      id: `bootstrap-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date().toLocaleTimeString('zh-CN'),
    },
  ];
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(
    () => sessions.find((s) => s.id === activeSessionId)?.messages ?? [],
    [sessions, activeSessionId],
  );

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const saved = readPersisted();
    if (saved && saved.sessions.length > 0) {
      setSessions(saved.sessions);
      const aid =
        saved.activeSessionId && saved.sessions.some((s) => s.id === saved.activeSessionId)
          ? saved.activeSessionId
          : saved.sessions[0].id;
      setActiveSessionId(aid);
      setIsLoading(false);
      return;
    }
    (async () => {
      setIsLoading(true);
      try {
        const initial = await fetchOverviewMessages();
        if (cancelled) return;
        const id = `sess-${Date.now()}`;
        const sess: ChatSession = {
          id,
          title: sessionTitleFromMessages(initial),
          updatedAt: Date.now(),
          messages: initial,
        };
        setSessions([sess]);
        setActiveSessionId(id);
      } catch (err) {
        console.error('AI bootstrap overview failed:', err);
        if (!cancelled) {
          const errText =
            err instanceof TypeError && err.message.includes('fetch')
              ? formatChatApiError(err)
              : err instanceof Error && err.message.length < 200
                ? `监测概览加载失败：${err.message}`
                : '监测概览加载失败，请稍后重试。';
          const id = `sess-${Date.now()}`;
          const initial: Message[] = [
            {
              id: `bootstrap-err-${Date.now()}`,
              role: 'assistant',
              content: errText,
              timestamp: new Date().toLocaleTimeString('zh-CN'),
            },
          ];
          setSessions([{ id, title: '加载失败', updatedAt: Date.now(), messages: initial }]);
          setActiveSessionId(id);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || sessions.length === 0 || !activeSessionId) return;
    writePersisted(sessions, activeSessionId);
  }, [sessions, activeSessionId, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const executeTool = async (toolName: string, args: Record<string, unknown>): Promise<string> => {
    switch (toolName) {
      case 'query_devices': {
        const devices: Device[] = await deviceApi.getAll({
          buildingId: args.buildingId as string,
          status: args.status as string,
          type: args.type as string,
        });
        return JSON.stringify(devices);
      }
      case 'query_alerts': {
        const alerts: Alert[] = await alertApi.getAll({
          buildingId: args.buildingId as string,
          level: args.level as string,
          acknowledged: args.acknowledged as boolean,
        });
        return JSON.stringify(alerts);
      }
      case 'create_work_order': {
        const rawPriority = (args.priority as string) || 'medium';
        const priority: WorkOrderPriority =
          rawPriority === 'high' || rawPriority === 'low' ? rawPriority : 'medium';
        const workOrder: WorkOrder = await workOrderApi.create({
          title: args.title as string,
          description: args.description as string,
          deviceId: args.deviceId as string,
          priority,
        });
        return JSON.stringify(workOrder);
      }
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !activeSessionId) return;
    const sid = activeSessionId;

    const userText = inputValue.trim();
    const userMessage: Message = {
      id: `u-${Date.now()}`,
      content: userText,
      role: 'user',
      timestamp: new Date().toLocaleTimeString('zh-CN'),
    };

    patchSessionMessages(setSessions, sid, (prev) => [...prev, userMessage]);
    const snapshot = [...messages, userMessage];
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = uiMessagesToChatHistory(snapshot);
      let currentMessages = [...conversationHistory];

      chatLoop: while (true) {
        let response: Awaited<ReturnType<typeof chatApi.sendMessage>>;
        try {
          response = await chatApi.sendMessage(currentMessages);
        } catch (chatErr) {
          console.error('Chat API failed:', chatErr);
          patchSessionMessages(setSessions, sid, (prev) => [
            ...prev,
            {
              id: `err-chat-${Date.now()}`,
              content: formatChatApiError(chatErr),
              role: 'assistant',
              timestamp: new Date().toLocaleTimeString('zh-CN'),
            },
          ]);
          break chatLoop;
        }

        if (response.tool_calls && response.tool_calls.length > 0) {
          for (const toolCall of response.tool_calls) {
            const toolInfo = TOOL_INFO[toolCall.function.name] || {
              label: toolCall.function.name,
              description: `正在执行 ${toolCall.function.name}...`,
            };

            patchSessionMessages(setSessions, sid, (prev) => [
              ...prev,
              {
                id: toolCall.id,
                content: toolInfo.description,
                role: 'assistant',
                timestamp: new Date().toLocaleTimeString('zh-CN'),
                isProcessing: true,
              },
            ]);

            let args: Record<string, unknown>;
            try {
              args = JSON.parse(toolCall.function.arguments || '{}') as Record<string, unknown>;
            } catch (parseErr) {
              console.error('Tool arguments JSON parse failed:', parseErr);
              patchSessionMessages(setSessions, sid, (prev) => [
                ...prev.slice(0, -1),
                {
                  id: `err-parse-${Date.now()}`,
                  content: formatToolFailure(toolInfo.label, parseErr),
                  role: 'assistant',
                  timestamp: new Date().toLocaleTimeString('zh-CN'),
                },
              ]);
              break chatLoop;
            }

            let toolResult: string;
            try {
              toolResult = await executeTool(toolCall.function.name, args);
            } catch (toolErr) {
              console.error('Tool execution failed:', toolErr);
              patchSessionMessages(setSessions, sid, (prev) => [
                ...prev.slice(0, -1),
                {
                  id: `err-tool-${Date.now()}`,
                  content: formatToolFailure(toolInfo.label, toolErr),
                  role: 'assistant',
                  timestamp: new Date().toLocaleTimeString('zh-CN'),
                },
              ]);
              break chatLoop;
            }

            const assistantMessage: ChatMessage = {
              role: 'assistant',
              content: null,
              tool_calls: [toolCall],
            };
            const toolMessage: ChatMessage = {
              role: 'tool',
              content: toolResult,
              tool_call_id: toolCall.id,
            };
            currentMessages.push(assistantMessage, toolMessage);

            patchSessionMessages(setSessions, sid, (prev) => [
              ...prev.slice(0, -1),
              {
                id: toolCall.id,
                content: `${toolInfo.label} 完成`,
                role: 'tool',
                timestamp: new Date().toLocaleTimeString('zh-CN'),
                toolCallId: toolCall.id,
              },
            ]);
          }
        } else {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: response.content || '抱歉，我无法理解您的问题。',
            role: 'assistant',
            timestamp: new Date().toLocaleTimeString('zh-CN'),
          };
          patchSessionMessages(setSessions, sid, (prev) => [...prev, assistantMessage]);
          break chatLoop;
        }
      }
    } catch (error) {
      console.error('AI request failed:', error);
      patchSessionMessages(setSessions, sid, (prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: formatChatApiError(error),
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString('zh-CN'),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async () => {
    if (isLoading) return;
    setDrawerOpen(false);
    setIsLoading(true);
    try {
      const initial = await fetchOverviewMessages();
      const id = `sess-${Date.now()}`;
      const sess: ChatSession = {
        id,
        title: sessionTitleFromMessages(initial),
        updatedAt: Date.now(),
        messages: initial,
      };
      setSessions((prev) => [sess, ...prev].slice(0, MAX_SESSIONS));
      setActiveSessionId(id);
    } catch (err) {
      console.error('New chat overview failed:', err);
      const errText =
        err instanceof TypeError && err.message.includes('fetch')
          ? formatChatApiError(err)
          : err instanceof Error && err.message.length < 200
            ? `监测概览加载失败：${err.message}`
            : '监测概览加载失败，请稍后重试。';
      const id = `sess-${Date.now()}`;
      const errMsg: Message = {
        id: `bootstrap-err-${Date.now()}`,
        role: 'assistant',
        content: errText,
        timestamp: new Date().toLocaleTimeString('zh-CN'),
      };
      const sessErr: ChatSession = {
        id,
        title: '加载失败',
        updatedAt: Date.now(),
        messages: [errMsg],
      };
      setSessions((prev) => [sessErr, ...prev].slice(0, MAX_SESSIONS));
      setActiveSessionId(id);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSession = (id: string) => {
    if (isLoading) return;
    setActiveSessionId(id);
    setDrawerOpen(false);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSend();
    }
  };

  const historyGroups = useMemo(() => groupSessionsByRecency(sessions), [sessions]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 12px 12px 8px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
          flexShrink: 0,
          gap: 8,
        }}
      >
        <div style={{ width: 44, flexShrink: 0, display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="button"
            aria-label="打开对话历史"
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: 'none',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ClockCircleIcon size={20} color="#333" />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              minWidth: 0,
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#333' }}>AI 工单助手</h2>
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: '#999',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 'min(200px, 36vw)',
              }}
            >
              智能分析设备状态
            </p>
          </div>
        </div>
        <div style={{ width: 44, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <XIcon size={16} color="#666" />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <>
          <button
            type="button"
            aria-label="关闭对话列表"
            onClick={() => setDrawerOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              border: 'none',
              padding: 0,
              margin: 0,
              background: 'rgba(0, 0, 0, 0.38)',
              cursor: 'pointer',
            }}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="对话历史"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 'min(288px, 88%)',
              maxWidth: 320,
              zIndex: 21,
              backgroundColor: '#fff',
              boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => void startNewChat()}
                disabled={isLoading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '11px 14px',
                  borderRadius: 999,
                  border: '1px solid #e8e8e8',
                  background: '#fafafa',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#141414',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '1.5px solid #141414',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PlusIcon size={14} color="#141414" />
                </span>
                开启新对话
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px' }}>
              {historyGroups.length === 0 ? (
                <div style={{ padding: '16px 14px', fontSize: 13, color: '#bbb' }}>暂无历史</div>
              ) : (
                historyGroups.map((group) => (
                  <div key={group.label}>
                    <div
                      style={{
                        padding: '10px 14px 6px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#8c8c8c',
                      }}
                    >
                      {group.label}
                    </div>
                    {group.items.map((sess) => {
                      const active = sess.id === activeSessionId;
                      const line = sess.title.replace(/\s+/g, ' ').trim() || '新对话';
                      return (
                        <button
                          key={sess.id}
                          type="button"
                          disabled={isLoading}
                          onClick={() => selectSession(sess.id)}
                          title={line}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            background: active ? '#e6f4ff' : 'transparent',
                            padding: '10px 14px',
                            fontSize: 14,
                            color: '#141414',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            lineHeight: 1.35,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {line.length > 36 ? `${line.slice(0, 36)}…` : line}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#fafafa',
          minHeight: 0,
        }}
      >
        {messages.length === 0 ? (
          isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#666' }}>
              <LoaderIcon
                size={28}
                color="#1890ff"
                style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 16px' }}
              />
              <p style={{ fontSize: '14px', margin: 0 }}>正在加载监测概览…</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <div
                style={{
                  ...AI_ICON_PANEL,
                  width: 64,
                  height: 64,
                  margin: '0 auto 16px',
                }}
              >
                <img src={aiAssistantIconUrl} alt="" width={40} height={40} style={{ display: 'block' }} />
              </div>
              <p style={{ fontSize: '14px', marginBottom: '8px' }}>您好！我是智能工单助手</p>
              <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
                我可以帮您查询设备状态、查看告警、创建工单。
              </p>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {toDisplayItems(messages).map((item) => {
              if ('kind' in item && item.kind === 'paired') {
                const { tool, assistant } = item;
                return (
                  <div
                    key={`pair-${tool.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        maxWidth: '92%',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#141414',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      >
                        <img src={aiAssistantIconUrl} alt="" width={16} height={16} style={{ display: 'block' }} />
                      </div>
                      <div>
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: '4px 16px 16px 16px',
                            backgroundColor: '#fff',
                            color: '#333',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              color: '#389e0d',
                              marginBottom: 8,
                              fontWeight: 500,
                            }}
                          >
                            {tool.content}
                          </div>
                          <AssistantMessageBody content={assistant.content} />
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#999',
                            marginTop: '4px',
                            textAlign: 'left',
                            padding: '0 4px',
                          }}
                        >
                          {assistant.timestamp}
                          <span style={{ marginLeft: '8px', color: '#bbb' }}>工具调用</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              const message = item as Message;
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      maxWidth: '85%',
                    }}
                  >
                    {message.role !== 'user' && (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: message.role === 'tool' ? '#52c41a' : '#141414',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      >
                        {message.role === 'tool' ? (
                          <span style={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}>T</span>
                        ) : (
                          <img src={aiAssistantIconUrl} alt="" width={16} height={16} style={{ display: 'block' }} />
                        )}
                      </div>
                    )}
                    <div>
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius:
                            message.role === 'user'
                              ? '16px 4px 16px 16px'
                              : message.role === 'tool'
                                ? '4px 16px 16px 16px'
                                : '4px 16px 16px 16px',
                          backgroundColor:
                            message.role === 'user'
                              ? '#1890ff'
                              : message.role === 'tool'
                                ? '#f6ffed'
                                : '#fff',
                          color: message.role === 'user' ? '#fff' : '#333',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          boxShadow: message.role === 'assistant' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                        }}
                      >
                        {message.isProcessing && (
                          <LoaderIcon
                            size={16}
                            color={message.role === 'user' ? '#fff' : '#1890ff'}
                            style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }}
                          />
                        )}
                        {message.role === 'assistant' && !message.isProcessing ? (
                          <AssistantMessageBody content={message.content} />
                        ) : (
                          message.content
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#999',
                          marginTop: '4px',
                          textAlign: message.role === 'user' ? 'right' : 'left',
                          padding: '0 4px',
                        }}
                      >
                        {message.timestamp}
                        {message.role === 'tool' && message.toolCallId && (
                          <span style={{ marginLeft: '8px' }}>[工具调用]</span>
                        )}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#1890ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '4px',
                        }}
                      >
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>U</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fff',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="请输入问题..."
            disabled={isLoading}
            aria-label="输入问题"
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '12px',
              border: '1px solid #d9d9d9',
              fontSize: '14px',
              lineHeight: 1.45,
              fontFamily: 'inherit',
              backgroundColor: '#fafafa',
              minHeight: '40px',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={isLoading || !inputValue.trim()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: isLoading || !inputValue.trim() ? '#d9d9d9' : '#1890ff',
              color: '#fff',
              cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <LoaderIcon size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <SendIcon size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
