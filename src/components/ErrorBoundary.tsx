import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 24,
            maxWidth: 480,
            margin: '10vh auto',
            fontFamily: 'system-ui, sans-serif',
            color: '#333',
          }}
        >
          <h2 style={{ marginTop: 0 }}>页面出了点问题</h2>
          <p style={{ lineHeight: 1.6, color: '#666' }}>
            界面渲染时发生异常，已避免白屏。请尝试刷新页面；若反复出现，请查看浏览器控制台中的错误信息。
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #1890ff',
              background: '#fff',
              color: '#1890ff',
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
