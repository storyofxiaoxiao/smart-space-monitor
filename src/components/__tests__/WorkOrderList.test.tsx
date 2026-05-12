import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WorkOrderList } from '../WorkOrderList';
import { workOrderApi } from '../../api';

vi.mock('../../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../api')>();
  return {
    ...actual,
    workOrderApi: {
      ...actual.workOrderApi,
      getAll: vi.fn(),
    },
  };
});

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
    vi.mocked(workOrderApi.getAll).mockResolvedValue(mockWorkOrders);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display work orders correctly', async () => {
    render(<WorkOrderList />);

    await waitFor(() => {
      expect(screen.getByText('WO-001')).toBeInTheDocument();
      expect(screen.getByText('测试工单')).toBeInTheDocument();
      expect(screen.getByText('设备_001')).toBeInTheDocument();
    });
    expect(workOrderApi.getAll).toHaveBeenCalledWith();
  });

  it('should show create button', () => {
    render(<WorkOrderList />);

    const buttons = screen.getAllByRole('button', { name: /创建工单/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it('should show empty state when API returns no work orders', async () => {
    vi.mocked(workOrderApi.getAll).mockResolvedValue([]);

    render(<WorkOrderList />);

    await waitFor(() => {
      expect(screen.getByText('暂无工单')).toBeInTheDocument();
    });
    expect(workOrderApi.getAll).toHaveBeenCalled();
  });
});
