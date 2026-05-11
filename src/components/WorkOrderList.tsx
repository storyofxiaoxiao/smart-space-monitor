import { useState, useEffect } from 'react';
import { PlusIcon, CheckCircleIcon, AlertCircleIcon, ClockCircleIcon, ChevronRightIcon } from '../icons';
import { workOrderApi } from '../api';
import type { WorkOrder } from '../types';
import { WorkOrderDetail } from './WorkOrderDetail';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string; icon: typeof CheckCircleIcon }> = {
  pending: { label: '待处理', color: '#faad14', bgColor: '#fffbe6', icon: ClockCircleIcon },
  processing: { label: '处理中', color: '#1890ff', bgColor: '#e6f7ff', icon: AlertCircleIcon },
  completed: { label: '已完成', color: '#52c41a', bgColor: '#f6ffed', icon: CheckCircleIcon },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: '高', color: '#ff4d4f' },
  medium: { label: '中', color: '#faad14' },
  low: { label: '低', color: '#52c41a' },
};

export function WorkOrderList() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setLoading(true);
      try {
        const data = await workOrderApi.getAll();
        setWorkOrders(data);
      } catch (error) {
        console.error('Failed to fetch work orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  const handleWorkOrderCreated = () => {
    setShowCreateModal(false);
    const fetchWorkOrders = async () => {
      try {
        const data = await workOrderApi.getAll();
        setWorkOrders(data);
      } catch (error) {
        console.error('Failed to fetch work orders:', error);
      }
    };
    fetchWorkOrders();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>工单列表</h2>
        <button
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
          }}
        >
          <PlusIcon size={16} />
          创建工单
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>加载中...</div>
      ) : workOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无工单</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {workOrders.map((workOrder) => {
            const status = STATUS_LABELS[workOrder.status];
            const priority = PRIORITY_LABELS[workOrder.priority];
            const StatusIcon = status.icon;

            return (
              <div
                key={workOrder.id}
                onClick={() => setSelectedWorkOrder(workOrder)}
                style={{
                  padding: '16px',
                  backgroundColor: '#fff',
                  border: '1px solid #e8e8e8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1890ff';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e8e8e8';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 600 }}>{workOrder.title}</span>
                  <span
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: `${priority.color}20`,
                      color: priority.color,
                      fontSize: '12px',
                    }}
                  >
                    {priority.label}优先级
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  {workOrder.deviceName}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'flex',
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
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {formatDate(workOrder.createdAt)}
                  </span>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <ChevronRightIcon size={14} color="#999" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedWorkOrder && (
        <WorkOrderDetail
          workOrder={selectedWorkOrder}
          onClose={() => setSelectedWorkOrder(null)}
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
