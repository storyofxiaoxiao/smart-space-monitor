import React from 'react';
import { DeviceType } from '../types';
import { TYPE_CONFIG } from '../constants';
import { IconProps } from '../icons';

interface DeviceStatusCardProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  color: string;
  bgColor: string;
  count: number;
  typeCounts: Record<DeviceType, number>;
}

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  icon: Icon,
  label,
  color,
  bgColor,
  count,
  typeCounts,
}) => {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#fff',
        border: '1px solid #e8e8e8',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={color} />
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: color }}>{count}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{label}</div>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#f0f0f0', marginBottom: '12px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '8px' }}>
        {Object.entries(typeCounts).map(([type, typeCount]) => (
          <div key={type} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', color: '#999' }}>{TYPE_CONFIG[type]?.label}</div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{typeCount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
