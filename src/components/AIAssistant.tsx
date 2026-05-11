import { useState, useRef, useEffect } from 'react';
import { XIcon, BotIcon, SendIcon } from '../icons';
import { chatApi } from '../api';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      const response = await chatApi.sendMessage([{ role: 'user', content: inputValue.trim() }]);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString('zh-CN'),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI request failed:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，我暂时无法回答您的问题，请稍后再试。',
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '600px',
          maxHeight: '70vh',
          backgroundColor: '#fff',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BotIcon size={18} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AI 工单助手</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>智能分析设备状态，生成工单建议</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon size={14} color="#666" />
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
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
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
              <p>您好！我是智能工单助手</p>
              <p style={{ fontSize: '13px' }}>请问有什么可以帮您的？</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: message.role === 'user' ? '#1890ff' : '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {message.role === 'user' ? (
                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>U</span>
                  ) : (
                    <BotIcon size={16} color="#fff" />
                  )}
                </div>
                <div>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: message.role === 'user' ? '#1890ff' : '#fff',
                      color: message.role === 'user' ? '#fff' : '#333',
                      fontSize: '14px',
                      maxWidth: '80%',
                      boxShadow: message.role === 'assistant' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                    }}
                  >
                    {message.content}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#999',
                      marginTop: '4px',
                      marginLeft: '4px',
                    }}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            gap: '12px',
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
            }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            style={{
              width: '44px',
              height: '44px',
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
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
