export interface Building {
  id: string;
  name: string;
  floors: number;
  deviceCount: number;
}

export type DeviceStatus = 'normal' | 'warning' | 'fault' | 'offline';
export type DeviceType = 'elevator' | 'hvac' | 'pump' | 'lighting' | 'fire_pressure';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  typeName: string;
  buildingId: string;
  floor: number;
  status: DeviceStatus;
  lastUpdated: string;
  alerts?: Alert[];
}

export type AlertLevel = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  buildingId?: string;
  level: AlertLevel;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export type WorkOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed';
export type WorkOrderPriority = 'high' | 'medium' | 'low';

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  deviceId: string;
  deviceName: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  createdAt: string;
  updatedAt: string;
  processLogs?: { timestamp: string; action: string }[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface CreateWorkOrderRequest {
  title: string;
  description: string;
  deviceId: string;
  priority: WorkOrderPriority;
}

export interface UpdateWorkOrderRequest {
  status: WorkOrderStatus;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
