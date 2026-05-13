import React from 'react';
import type { DeviceStatus } from '../../types';
import { DEVICE_STATUSES } from '../../constants';
import type { IconProps } from '../../components/icons';

interface DeviceTypeCardProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  color: string;
  count: number;
  statusCounts: Record<DeviceStatus, number>;
  onMainCountClick: () => void;
  onStatusCountClick: (status: DeviceStatus) => void;
}

const countBtnStyle: React.CSSProperties = {
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  padding: '2px 6px',
  margin: '-2px -6px',
  borderRadius: '6px',
  font: 'inherit',
  textAlign: 'left' as const,
  transition: 'background-color 0.15s ease',
};

export const DeviceTypeCard: React.FC<DeviceTypeCardProps> = ({
  icon: Icon,
  label,
  count,
  statusCounts,
  onMainCountClick,
  onStatusCountClick,
}) => {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        border: '1px solid #1890ff',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-24px',
          left: '16px',
          height: '24px',
          padding: '0 16px',
          borderRadius: '4px 4px 0 0',
          backgroundColor: '#1890ff',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 500,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#e6f7ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color="#1890ff" />
        </div>
        <div>
          <button
            type="button"
            title="按该类型筛选设备列表"
            onClick={onMainCountClick}
            style={{ ...countBtnStyle, display: 'block' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(24, 144, 255, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#333' }}>{count}</span>
          </button>
          <div style={{ fontSize: '12px', color: '#999' }}>设备总数</div>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#f0f0f0', marginBottom: '12px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {Object.entries(statusCounts).map(([status, statusCount]) => (
          <div key={status} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', color: '#999' }}>
              {DEVICE_STATUSES[status as keyof typeof DEVICE_STATUSES]?.label}
            </div>
            <button
              type="button"
              title="按类型+状态筛选"
              onClick={() => onStatusCountClick(status as DeviceStatus)}
              style={{ ...countBtnStyle, fontSize: '14px', fontWeight: 500, color: '#333' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {statusCount}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
