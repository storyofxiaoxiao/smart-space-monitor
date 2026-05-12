import { useState, useEffect, Fragment } from 'react';
import { XIcon, CheckCircleIcon, AlertCircleIcon, ClockCircleIcon, WrenchIcon } from '../icons';
import { WORK_ORDER_STATUSES, WORK_ORDER_PRIORITIES, getStatusConfig } from '../constants';
import { workOrderApi } from '../api';
import type { WorkOrder, WorkOrderStatus } from '../types';

interface WorkOrderDetailProps {
  workOrder: WorkOrder;
  onClose: () => void;
  /** 状态在服务端更新后回调，用于同步列表与当前详情 */
  onUpdated?: (workOrder: WorkOrder) => void;
}

const NEXT_STATUS: Partial<Record<WorkOrderStatus, WorkOrderStatus>> = {
  pending: 'assigned',
  assigned: 'in_progress',
  in_progress: 'completed',
};

const ACTION_LABEL: Partial<Record<WorkOrderStatus, string>> = {
  pending: '派单',
  assigned: '开始处理',
  in_progress: '完成工单',
};

/** 与后端合法转移顺序一致，用于详情内展示 */
const STATUS_FLOW: WorkOrderStatus[] = ['pending', 'assigned', 'in_progress', 'completed'];

export function WorkOrderDetail({ workOrder, onClose, onUpdated }: WorkOrderDetailProps) {
  const [wo, setWo] = useState<WorkOrder>(workOrder);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setWo(workOrder);
    setError('');
  }, [workOrder]);

  const status = getStatusConfig(WORK_ORDER_STATUSES, wo.status);
  const priority = WORK_ORDER_PRIORITIES[wo.priority] || { label: '中', color: '#faad14' };
  const StatusIcon =
    wo.status === 'completed'
      ? CheckCircleIcon
      : wo.status === 'pending'
        ? ClockCircleIcon
        : AlertCircleIcon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAdvanceStatus = async () => {
    const next = NEXT_STATUS[wo.status];
    if (!next) return;
    setError('');
    setAdvancing(true);
    try {
      const updated = await workOrderApi.update(wo.id, { status: next });
      setWo(updated);
      onUpdated?.(updated);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '状态更新失败';
      setError(msg);
    } finally {
      setAdvancing(false);
    }
  };

  const canAdvance = wo.status !== 'completed' && NEXT_STATUS[wo.status] != null;
  const flowIndex = STATUS_FLOW.indexOf(wo.status);
  const safeFlowIndex = flowIndex >= 0 ? flowIndex : 0;

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
          width: '540px',
          maxWidth: '96vw',
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
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>工单编号</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333', fontFamily: 'monospace' }}>{wo.id}</div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>工单标题</div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{wo.title}</h3>
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
              <span>{wo.deviceName}</span>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>问题描述</div>
            <div style={{ padding: '12px', backgroundColor: '#fafafa', borderRadius: '4px', fontSize: '13px' }}>
              {wo.description}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>创建时间</div>
              <div style={{ fontSize: '13px' }}>{formatDate(wo.createdAt)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>更新时间</div>
              <div style={{ fontSize: '13px' }}>{formatDate(wo.updatedAt)}</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>状态流转</div>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {STATUS_FLOW.map((step, i) => {
                const cfg = WORK_ORDER_STATUSES[step];
                const done = i < safeFlowIndex;
                const active = i === safeFlowIndex;
                return (
                  <Fragment key={step}>
                    {i > 0 && (
                      <div
                        style={{
                          flex: 1,
                          height: 3,
                          minWidth: 6,
                          borderRadius: 1,
                          backgroundColor: safeFlowIndex >= i ? '#52c41a' : '#e8e8e8',
                          marginBottom: 26,
                        }}
                        aria-hidden
                      />
                    )}
                    <div
                      style={{
                        flex: '0 0 auto',
                        width: 72,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#fff',
                          backgroundColor: done ? '#52c41a' : active ? '#1890ff' : '#d9d9d9',
                          boxShadow: active ? '0 0 0 3px rgba(24, 144, 255, 0.25)' : 'none',
                        }}
                        title={cfg.label}
                      >
                        {done ? '✓' : i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          lineHeight: 1.2,
                          textAlign: 'center',
                          color: active ? '#1890ff' : done ? '#389e0d' : '#999',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </Fragment>
                );
              })}
            </div>
            {canAdvance && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
                下一步：
                <span style={{ color: '#1890ff', fontWeight: 500 }}>
                  {WORK_ORDER_STATUSES[NEXT_STATUS[wo.status]!].label}
                </span>
                （点击「{ACTION_LABEL[wo.status]}」推进）
              </div>
            )}
            {!canAdvance && wo.status === 'completed' && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#52c41a' }}>工单已完成全部流转。</div>
            )}
          </div>

          {error && (
            <div
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                backgroundColor: '#fff2f0',
                color: '#cf1322',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
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
            {canAdvance && (
              <button
                type="button"
                onClick={handleAdvanceStatus}
                disabled={advancing}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: advancing ? '#91caff' : '#1890ff',
                  color: '#fff',
                  cursor: advancing ? 'not-allowed' : 'pointer',
                }}
              >
                {advancing ? '提交中…' : ACTION_LABEL[wo.status]}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
