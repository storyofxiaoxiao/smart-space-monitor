import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CreateWorkOrderModal } from '../pages/work-orders/CreateWorkOrderModal';

/** 打开创建工单弹窗时的可选参数 */
export type OpenCreateWorkOrderOptions = {
  /** 预选关联设备（不切换路由，叠在设备详情之上） */
  initialDeviceId?: string;
  /** 创建成功并关闭弹窗后回调（例如刷新工单列表） */
  onSuccess?: () => void;
};

type CreateWorkOrderDialogContextValue = {
  /** 打开创建工单弹窗 */
  open: (options?: OpenCreateWorkOrderOptions) => void;
  /** 关闭弹窗（取消创建） */
  close: () => void;
};

const CreateWorkOrderDialogContext = createContext<CreateWorkOrderDialogContextValue | null>(null);

const CREATE_WO_OVERLAY_Z = 1100;

/**
 * 全局挂载一个「创建工单」弹窗，通过 `useCreateWorkOrderDialog().open()` / `close()` 命令式控制。
 */
export function CreateWorkOrderDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialDeviceId, setInitialDeviceId] = useState<string | undefined>(undefined);
  const onSuccessRef = useRef<(() => void) | undefined>(undefined);

  const close = useCallback(() => {
    setIsOpen(false);
    setInitialDeviceId(undefined);
    onSuccessRef.current = undefined;
  }, []);

  const open = useCallback((options?: OpenCreateWorkOrderOptions) => {
    onSuccessRef.current = options?.onSuccess;
    setInitialDeviceId(options?.initialDeviceId);
    setIsOpen(true);
  }, []);

  const handleCreated = useCallback(() => {
    try {
      onSuccessRef.current?.();
    } finally {
      close();
    }
  }, [close]);

  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <CreateWorkOrderDialogContext.Provider value={value}>
      {children}
      <CreateWorkOrderModal
        isOpen={isOpen}
        initialDeviceId={initialDeviceId}
        overlayZIndex={CREATE_WO_OVERLAY_Z}
        onClose={close}
        onCreate={handleCreated}
      />
    </CreateWorkOrderDialogContext.Provider>
  );
}

export function useCreateWorkOrderDialog(): CreateWorkOrderDialogContextValue {
  const ctx = useContext(CreateWorkOrderDialogContext);
  if (!ctx) {
    throw new Error('useCreateWorkOrderDialog 必须在 CreateWorkOrderDialogProvider 内使用');
  }
  return ctx;
}
