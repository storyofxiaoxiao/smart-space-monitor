import { useState, useEffect, useCallback } from 'react';
import { PlusIcon, CheckCircleIcon, AlertCircleIcon, ClockCircleIcon, ChevronRightIcon } from '../icons';
import { LIST_PAGE_SIZE, WORK_ORDER_STATUSES, WORK_ORDER_PRIORITIES, getStatusConfig } from '../constants';
import { ListPaginationBar } from './ListPaginationBar';
import { workOrderApi } from '../api';
import type { WorkOrder } from '../types';
import { WorkOrderDetail } from './WorkOrderDetail';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';
import { FilterDropdown } from './FilterDropdown';

export function WorkOrderList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [page, setPage] = useState(1);

  const loadWorkOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        statusFilter === 'all'
          ? await workOrderApi.getAll()
          : await workOrderApi.getAll({ status: statusFilter });
      setWorkOrders(data);
    } catch (error) {
      console.error('Failed to fetch work orders:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    void loadWorkOrders();
  }, [loadWorkOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const total = workOrders.length;
  const pageCount = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
  useEffect(() => {
    setPage((prev) => Math.min(prev, pageCount));
  }, [pageCount]);

  const safePage = Math.min(page, pageCount);
  const pagedWorkOrders = workOrders.slice((safePage - 1) * LIST_PAGE_SIZE, safePage * LIST_PAGE_SIZE);

  const handleWorkOrderCreated = () => {
    setShowCreateModal(false);
    void loadWorkOrders();
  };

  const handleDetailUpdated = (updated: WorkOrder) => {
    setWorkOrders((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setSelectedWorkOrder(updated);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusOptions = [
    { value: 'all', label: '全部', color: '#999' },
    ...Object.entries(WORK_ORDER_STATUSES).map(([key, config]) => ({
      value: key,
      label: config.label,
      color: config.color,
    })),
  ];

  const thead = (
    <thead>
      <tr style={{ backgroundColor: '#fafafa' }}>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>
          工单编号
        </th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>
          工单标题
        </th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>
          状态
        </th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>
          优先级
        </th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>
          创建时间
        </th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>
          关联设备
        </th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>
          操作
        </th>
      </tr>
    </thead>
  );

  return (
    <div>
      <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#333' }}>工单列表</h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <FilterDropdown
          label="状态"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          minWidth={120}
        />
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#1890ff',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <PlusIcon size={16} color="#ffffff" />
          创建工单
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          {thead}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                  加载中...
                </td>
              </tr>
            ) : workOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                  暂无工单
                </td>
              </tr>
            ) : (
              pagedWorkOrders.map((workOrder) => {
                const status = getStatusConfig(WORK_ORDER_STATUSES, workOrder.status);
                const priority = WORK_ORDER_PRIORITIES[workOrder.priority] || { label: '中', color: '#faad14' };
                const StatusIcon =
                  workOrder.status === 'completed'
                    ? CheckCircleIcon
                    : workOrder.status === 'pending'
                      ? ClockCircleIcon
                      : AlertCircleIcon;

                return (
                  <tr
                    key={workOrder.id}
                    onClick={() => setSelectedWorkOrder(workOrder)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#666' }}>
                      {workOrder.id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 500 }}>{workOrder.title}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: status.bgColor,
                          color: status.color,
                          fontSize: '12px',
                        }}
                      >
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: `${priority.color}20`,
                          color: priority.color,
                          fontSize: '12px',
                        }}
                      >
                        {priority.label}优先级
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#666' }}>{formatDate(workOrder.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>{workOrder.deviceName}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkOrder(workOrder);
                        }}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          border: '1px solid #d9d9d9',
                          backgroundColor: '#fff',
                          color: '#1890ff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        查看详情
                        <ChevronRightIcon size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ListPaginationBar total={total} page={page} pageSize={LIST_PAGE_SIZE} onPageChange={setPage} />

      {selectedWorkOrder && (
        <WorkOrderDetail
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
          onUpdated={handleDetailUpdated}
        />
      )}

      {showCreateModal && (
        <CreateWorkOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleWorkOrderCreated}
        />
      )}
    </div>
  );
}
