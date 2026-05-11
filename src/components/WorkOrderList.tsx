import { useState, useEffect } from 'react';
import { PlusIcon, CheckCircleIcon, AlertCircleIcon, ClockCircleIcon, ChevronRightIcon } from '../icons';
import { WORK_ORDER_STATUSES, WORK_ORDER_PRIORITIES, getStatusConfig } from '../constants';
import { workOrderApi } from '../api';
import type { WorkOrder } from '../types';
import { WorkOrderDetail } from './WorkOrderDetail';
import { CreateWorkOrderModal } from './CreateWorkOrderModal';

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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>工单标题</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>关联设备</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>优先级</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>状态</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>创建时间</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((workOrder) => {
                const status = getStatusConfig(WORK_ORDER_STATUSES, workOrder.status);
                const priority = WORK_ORDER_PRIORITIES[workOrder.priority] || { label: '中', color: '#faad14' };
                const StatusIcon = workOrder.status === 'completed' ? CheckCircleIcon :
                  workOrder.status === 'pending' ? ClockCircleIcon :
                    AlertCircleIcon;

                return (
                  <tr
                    key={workOrder.id}
                    onClick={() => setSelectedWorkOrder(workOrder)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 500 }}>{workOrder.title}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{workOrder.deviceName}</td>
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
                    <td style={{ padding: '12px 16px', color: '#666' }}>{formatDate(workOrder.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
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
              })}
            </tbody>
          </table>
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
