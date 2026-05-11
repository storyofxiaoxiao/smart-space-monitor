import { XIcon, CheckCircleIcon, AlertCircleIcon, ClockCircleIcon, WrenchIcon, ToolIcon } from '../icons';
import type { WorkOrder } from '../types';

interface WorkOrderDetailProps {
  workOrder: WorkOrder;
  onClose: () => void;
}

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

export function WorkOrderDetail({ workOrder, onClose }: WorkOrderDetailProps) {
  const status = STATUS_LABELS[workOrder.status];
  const priority = PRIORITY_LABELS[workOrder.priority];
  const StatusIcon = status.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '500px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>工单详情</h2>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon size={14} color="#666" />
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>工单标题</div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{workOrder.title}</h3>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>状态</div>
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
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>优先级</div>
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
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>关联设备</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <WrenchIcon size={16} color="#666" />
              <span>{workOrder.deviceName}</span>
              <span style={{ color: '#999', fontSize: '13px' }}>({workOrder.buildingId})</span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>问题描述</div>
            <div style={{ padding: '12px', backgroundColor: '#fafafa', borderRadius: '4px', fontSize: '13px' }}>
              {workOrder.description}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>创建时间</div>
              <div style={{ fontSize: '13px' }}>{formatDate(workOrder.createdAt)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>更新时间</div>
              <div style={{ fontSize: '13px' }}>{formatDate(workOrder.updatedAt)}</div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <ToolIcon size={14} color="#999" style={{ marginRight: '4px' }} />
              处理记录
            </div>
            {workOrder.processLogs && workOrder.processLogs.length > 0 ? (
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {workOrder.processLogs.map((log) => (
                  <div
                    key={log.timestamp}
                    style={{
                      padding: '8px 12px',
                      marginBottom: '4px',
                      backgroundColor: '#fafafa',
                      borderRadius: '4px',
                      fontSize: '13px',
                    }}
                  >
                    <span style={{ color: '#999', marginRight: '8px' }}>
                      {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                    </span>
                    <span>{log.action}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px', color: '#999' }}>暂无处理记录</div>
            )}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fff',
                color: '#666',
                cursor: 'pointer',
              }}
            >
              关闭
            </button>
            {workOrder.status !== 'completed' && (
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#1890ff',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                开始处理
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
