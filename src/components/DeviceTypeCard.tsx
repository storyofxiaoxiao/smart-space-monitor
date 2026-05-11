import React from 'react';
import type { DeviceStatus } from '../types';
import { DEVICE_STATUSES } from '../constants';
import { IconProps } from '../icons';

interface DeviceTypeCardProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  color: string;
  count: number;
  statusCounts: Record<DeviceStatus, number>;
}

export const DeviceTypeCard: React.FC<DeviceTypeCardProps> = ({
  icon: Icon,
  label,
  count,
  statusCounts,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', }}>
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
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#333' }}>{count}</div>
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
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{statusCount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
