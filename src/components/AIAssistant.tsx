import { useState, useRef, useEffect, type CSSProperties, type KeyboardEvent } from 'react';
import { XIcon, SendIcon, LoaderIcon } from '../icons';
import aiAssistantIconUrl from '../assets/icons/ai-chat-icon.svg';
import { chatApi, deviceApi, alertApi, workOrderApi } from '../api';
import type { ChatMessage, Device, Alert, WorkOrder, WorkOrderPriority } from '../types';
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

/** 工具完成气泡与紧随其后的助手总结合并为一条展示（仍保留 tool 消息供多轮对话 API） */
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

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date().toLocaleTimeString('zh-CN'),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        tool_call_id: msg.toolCallId,
      }));

      conversationHistory.push({ role: 'user', content: inputValue.trim() });

      let currentMessages = [...conversationHistory];

      chatLoop: while (true) {
        let response: Awaited<ReturnType<typeof chatApi.sendMessage>>;
        try {
          response = await chatApi.sendMessage(currentMessages);
        } catch (chatErr) {
          console.error('Chat API failed:', chatErr);
          setMessages((prev) => [
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

            setMessages((prev) => [
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
              setMessages((prev) => [
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
              setMessages((prev) => [
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

            setMessages((prev) => [
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
          setMessages((prev) => [...prev, assistantMessage]);
          break chatLoop;
        }
      }
    } catch (error) {
      console.error('AI request failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: formatChatApiError(error),
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('zh-CN'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #f0f0f0',
          backgroundColor: '#fafafa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ ...AI_ICON_PANEL, width: 36, height: 36 }}>
            <img src={aiAssistantIconUrl} alt="" width={22} height={22} style={{ display: 'block' }} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' }}>AI 工单助手</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>智能分析设备状态</p>
          </div>
        </div>
        <button
          onClick={onClose}
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
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          <XIcon size={16} color="#666" />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#fafafa',
        }}
      >
        {messages.length === 0 ? (
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
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end',
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '24px',
              border: '1px solid #d9d9d9',
              fontSize: '14px',
              backgroundColor: '#fafafa',
              resize: 'none',
            }}
          />
          <button
            onClick={handleSend}
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
              transition: 'background-color 0.2s',
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