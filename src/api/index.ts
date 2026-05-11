import type {
  Building,
  Device,
  Alert,
  WorkOrder,
  ChatMessage,
  CreateWorkOrderRequest,
  UpdateWorkOrderRequest,
} from '../types';

const BASE_URL = '/api';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const buildingApi = {
  getAll: async (): Promise<Building[]> => {
    return fetchJson(`${BASE_URL}/buildings`);
  },
};

export const deviceApi = {
  getAll: async (params?: {
    buildingId?: string;
    status?: string;
    type?: string;
  }): Promise<Device[]> => {
    const search = new URLSearchParams();
    if (params?.buildingId) search.set('buildingId', params.buildingId);
    if (params?.status) search.set('status', params.status);
    if (params?.type) search.set('type', params.type);
    const qs = search.toString();
    return fetchJson(`${BASE_URL}/devices${qs ? `?${qs}` : ''}`);
  },
  getById: async (id: string): Promise<Device> => {
    return fetchJson(`${BASE_URL}/devices/${id}`);
  },
};

export const alertApi = {
  getAll: async (params?: {
    buildingId?: string;
    level?: string;
    acknowledged?: boolean;
  }): Promise<Alert[]> => {
    const search = new URLSearchParams();
    if (params?.buildingId) search.set('buildingId', params.buildingId);
    if (params?.level) search.set('level', params.level);
    if (params?.acknowledged !== undefined) {
      search.set('acknowledged', String(params.acknowledged));
    }
    const qs = search.toString();
    return fetchJson(`${BASE_URL}/alerts${qs ? `?${qs}` : ''}`);
  },
  acknowledge: async (id: string): Promise<{ id: string; acknowledged: boolean }> => {
    return fetchJson(`${BASE_URL}/alerts/${id}/ack`, { method: 'POST' });
  },
};

export const workOrderApi = {
  getAll: async (params?: { status?: string }): Promise<WorkOrder[]> => {
    const search = new URLSearchParams();
    if (params?.status) search.set('status', params.status);
    const qs = search.toString();
    return fetchJson(`${BASE_URL}/work-orders${qs ? `?${qs}` : ''}`);
  },
  create: async (data: CreateWorkOrderRequest): Promise<WorkOrder> => {
    return fetchJson(`${BASE_URL}/work-orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update: async (id: string, data: UpdateWorkOrderRequest): Promise<WorkOrder> => {
    return fetchJson(`${BASE_URL}/work-orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export const chatApi = {
  sendMessage: async (messages: ChatMessage[]): Promise<ChatMessage> => {
    return fetchJson(`${BASE_URL}/chat`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },
};
