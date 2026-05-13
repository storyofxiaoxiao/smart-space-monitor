import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { WorkOrderDetail } from '../WorkOrderDetail';
import { workOrderApi } from '../../../api';
import type { WorkOrder } from '../../../types';

vi.mock('../../../api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../api')>();
  return {
    ...actual,
    workOrderApi: {
      ...actual.workOrderApi,
      update: vi.fn(),
    },
  };
});

const baseWorkOrder: WorkOrder = {
  id: 'WO-TEST-001',
  title: '测试维修',
  description: '描述内容',
  deviceId: 'elevator_001',
  deviceName: '电梯_001',
  status: 'pending',
  priority: 'medium',
  createdAt: '2026-04-15T09:00:00Z',
  updatedAt: '2026-04-15T09:00:00Z',
};

describe('WorkOrderDetail', () => {
  beforeEach(() => {
    vi.mocked(workOrderApi.update).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('展示状态流转四步与待派单场景下的「派单」操作', () => {
    const onClose = vi.fn();
    render(<WorkOrderDetail workOrder={baseWorkOrder} onClose={onClose} />);

    expect(screen.getByText('工单详情')).toBeInTheDocument();
    expect(screen.getByText('状态流转')).toBeInTheDocument();
    expect(screen.getAllByText('待派单').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('处理中')).toBeInTheDocument();
    expect(screen.getByText('已完成')).toBeInTheDocument();
    expect(screen.getByText(/下一步：/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '派单' })).toBeInTheDocument();
  });

  it('点击派单后调用 update、刷新本地状态并回调 onUpdated', async () => {
    const onUpdated = vi.fn();
    const updated: WorkOrder = {
      ...baseWorkOrder,
      status: 'assigned',
      updatedAt: '2026-05-01T12:00:00Z',
    };
    vi.mocked(workOrderApi.update).mockResolvedValue(updated);

    render(<WorkOrderDetail workOrder={baseWorkOrder} onClose={() => {}} onUpdated={onUpdated} />);

    fireEvent.click(screen.getByRole('button', { name: '派单' }));

    await waitFor(() => {
      expect(workOrderApi.update).toHaveBeenCalledWith('WO-TEST-001', { status: 'assigned' });
      expect(onUpdated).toHaveBeenCalledWith(updated);
    });
    expect(screen.getByRole('button', { name: '开始处理' })).toBeInTheDocument();
  });

  it('已完成工单不展示推进按钮，并提示流转结束', () => {
    render(
      <WorkOrderDetail
        workOrder={{ ...baseWorkOrder, status: 'completed' }}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByRole('button', { name: '派单' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '开始处理' })).not.toBeInTheDocument();
    expect(screen.getByText('工单已完成全部流转。')).toBeInTheDocument();
    expect(screen.getByTitle('已完成')).toHaveTextContent('✓');
  });

  it('推进失败时展示错误信息', async () => {
    vi.mocked(workOrderApi.update).mockRejectedValue(new Error('服务不可用'));

    render(<WorkOrderDetail workOrder={baseWorkOrder} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '派单' }));

    await waitFor(() => {
      expect(screen.getByText('服务不可用')).toBeInTheDocument();
    });
  });
});
