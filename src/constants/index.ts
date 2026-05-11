import type {
  DeviceStatus,
  DeviceType,
  WorkOrderStatus,
  WorkOrderPriority,
  AlertLevel,
} from '../types';

export const DEVICE_STATUSES = {
  normal: { label: '正常', color: '#52c41a', bgColor: '#f6ffed' },
  warning: { label: '告警', color: '#faad14', bgColor: '#fffbe6' },
  fault: { label: '故障', color: '#ff4d4f', bgColor: '#fff2f0' },
  offline: { label: '离线', color: '#d9d9d9', bgColor: '#fafafa' },
} as const satisfies Record<DeviceStatus, { label: string; color: string; bgColor: string }>;

export const DEVICE_TYPES = {
  elevator: { label: '电梯', color: '#1890ff' },
  hvac: { label: '空调', color: '#52c41a' },
  pump: { label: '水泵', color: '#722ed1' },
  lighting: { label: '照明', color: '#faad14' },
  fire_pressure: { label: '消防', color: '#ff4d4f' },
} as const satisfies Record<DeviceType, { label: string; color: string }>;

export const WORK_ORDER_STATUSES = {
  pending: { label: '待处理', color: '#faad14', bgColor: '#fffbe6' },
  assigned: { label: '已派单', color: '#722ed1', bgColor: '#f9f0ff' },
  in_progress: { label: '处理中', color: '#1890ff', bgColor: '#e6f7ff' },
  completed: { label: '已完成', color: '#52c41a', bgColor: '#f6ffed' },
} as const satisfies Record<WorkOrderStatus, { label: string; color: string; bgColor: string }>;

export const WORK_ORDER_PRIORITIES = {
  high: { label: '高', color: '#ff4d4f' },
  medium: { label: '中', color: '#faad14' },
  low: { label: '低', color: '#52c41a' },
} as const satisfies Record<WorkOrderPriority, { label: string; color: string }>;

export const ALERT_LEVELS = {
  critical: { label: '严重', color: '#ff4d4f' },
  warning: { label: '警告', color: '#faad14' },
  info: { label: '信息', color: '#1890ff' },
} as const satisfies Record<AlertLevel, { label: string; color: string }>;

export type StatusConfig<T extends string> = {
  [K in T]: {
    label: string;
    color: string;
    bgColor?: string;
  };
};

export function getStatusConfig<T extends string>(
  config: StatusConfig<T>,
  status: T
): { label: string; color: string; bgColor: string } {
  const result = config[status];
  return result ? { ...result, bgColor: result.bgColor || '#f5f5f5' } : { label: status, color: '#999', bgColor: '#f5f5f5' };
}
