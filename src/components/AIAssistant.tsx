import { useState, useRef, useEffect } from 'react';
import { XIcon, BotIcon, SendIcon, LoaderIcon } from '../icons';
import { chatApi, deviceApi, alertApi, workOrderApi } from '../api';
import type { ChatMessage, Device, Alert, WorkOrder } from '../types';

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

const TOOL_INFO: Record<string, { label: string; description: string }> = {
  query_devices: { label: '查询设备', description: '正在查询设备信息...' },
  query_alerts: { label: '查询告警', description: '正在查询告警记录...' },
  create_work_order: { label: '创建工单', description: '正在创建工单...' },
};

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
        const workOrder: WorkOrder = await workOrderApi.create({
          title: args.title as string,
          description: args.description as string,
          deviceId: args.deviceId as string,
          priority: (args.priority as string) || 'medium',
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

      while (true) {
        const response = await chatApi.sendMessage(currentMessages);

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

            const args = JSON.parse(toolCall.function.arguments || '{}');
            const toolResult = await executeTool(toolCall.function.name, args);

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
          break;
        }
      }
    } catch (error) {
      console.error('AI request failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，服务暂时不可用，请稍后再试。',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('zh-CN'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BotIcon size={20} color="#fff" />
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
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <BotIcon size={32} color="#fff" />
            </div>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>您好！我是智能工单助手</p>
            <p style={{ fontSize: '13px', lineHeight: '1.6' }}>
              我可以帮您查询设备状态、查看告警、创建工单。
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((message) => (
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
                        backgroundColor: message.role === 'tool' ? '#52c41a' : '#667eea',
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
                        <BotIcon size={14} color="#fff" />
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
                      {message.content}
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
            ))}
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