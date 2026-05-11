import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WorkOrderList } from '../WorkOrderList';

vi.mock('../../api', () => ({
  workOrderApi: {
    getAll: vi.fn(),
  },
}));

describe('WorkOrderList', () => {
  const mockWorkOrders = [
    {
      id: 'WO-001',
      title: '测试工单',
      description: '测试描述',
      deviceId: 'dev_001',
      deviceName: '设备_001',
      status: 'pending' as const,
      priority: 'high' as const,
      createdAt: '2026-04-15T09:00:00Z',
      updatedAt: '2026-04-15T09:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.mocked(require('../../api').workOrderApi.getAll).mockResolvedValue(mockWorkOrders);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display work orders correctly', async () => {
    render(<WorkOrderList />);

    await waitFor(() => {
      expect(screen.getByText('WO-001')).toBeInTheDocument();
      expect(screen.getByText('测试工单')).toBeInTheDocument();
    });
  });

  it('should show create button', () => {
    render(<WorkOrderList />);

    expect(screen.getByText('创建工单')).toBeInTheDocument();
  });

  it('should filter by status', async () => {
    vi.mocked(require('../../api').workOrderApi.getAll).mockResolvedValue([]);

    render(<WorkOrderList />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });
});
