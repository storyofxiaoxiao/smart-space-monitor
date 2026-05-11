export interface Building {
  id: string;
  name: string;
  floors: number;
  deviceCount: number;
}

export interface Device {
  id: string;
  name: string;
  type: 'elevator' | 'hvac' | 'pump' | 'lighting' | 'fire_pressure';
  typeName: string;
  buildingId: string;
  floor: number;
  status: 'normal' | 'warning' | 'fault' | 'offline';
  lastUpdated: string;
  alerts?: Alert[];
}

export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  buildingId?: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  deviceId: string;
  deviceName: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
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
  priority: 'high' | 'medium' | 'low';
}

export interface UpdateWorkOrderRequest {
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
}

export interface ErrorResponse {
  error: string;
  message: string;
}
