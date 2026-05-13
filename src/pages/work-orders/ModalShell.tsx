import type { CSSProperties, FormHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { XIcon } from '../../components/icons';

/** 弹窗底部次要按钮（取消 / 关闭） */
export const modalShellSecondaryButtonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: '4px',
  border: '1px solid #d9d9d9',
  backgroundColor: '#fff',
  color: '#666',
  cursor: 'pointer',
};

/** 弹窗底部主按钮（提交 / 派单等） */
export const modalShellPrimaryButtonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#1890ff',
  color: '#fff',
  cursor: 'pointer',
};

export const modalShellPrimaryButtonLoadingStyle: CSSProperties = {
  ...modalShellPrimaryButtonStyle,
  backgroundColor: '#91caff',
  cursor: 'not-allowed',
};

export type ModalShellSlots = {
  /** 标题区主文案 */
  title: ReactNode;
  /** 主内容（可滚动） */
  body: ReactNode;
  /** 底部操作区；不传则不渲染底栏 */
  footer?: ReactNode;
};

export type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  /** 面板宽度（px） */
  width?: number;
  /** 为 true 时点击遮罩不触发 onClose */
  preventBackdropClose?: boolean;
  slots: ModalShellSlots;
  /** 若传入，则将 body 与 footer 包在同一 `<form>` 内（如创建工单） */
  form?: Pick<FormHTMLAttributes<HTMLFormElement>, 'id' | 'onSubmit' | 'noValidate'>;
};

/**
 * 统一遮罩 + 白底卡片 + 标题栏 + 可滚动内容 + 可选底栏。
 * 业务弹窗通过 `slots` 注入各自内容。
 */
export function ModalShell({
  open,
  onClose,
  width = 520,
  preventBackdropClose = false,
  slots,
  form,
}: ModalShellProps) {
  if (!open) return null;

  const handleBackdropMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !preventBackdropClose) {
      onClose();
    }
  };

  const scrollBody = (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        minHeight: 0,
      }}
    >
      {slots.body}
    </div>
  );

  const footer =
    slots.footer != null ? (
      <footer
        style={{
          flexShrink: 0,
          borderTop: '1px solid #f0f0f0',
          padding: '16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
        }}
      >
        {slots.footer}
      </footer>
    ) : null;

  const middle = (
    <>
      {scrollBody}
      {footer}
    </>
  );

  const middleWrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
  };

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: `${width}px`,
          maxWidth: '96vw',
          maxHeight: '90vh',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
            flexShrink: 0,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#333' }}>{slots.title}</h2>
          <button
            type="button"
            aria-label="关闭"
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
        </header>

        {form ? (
          <form {...form} style={middleWrapperStyle}>
            {middle}
          </form>
        ) : (
          <div style={middleWrapperStyle}>{middle}</div>
        )}
      </div>
    </div>
  );
}
