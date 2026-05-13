import React from 'react';
import type { DeviceType } from '../../types';
import { TYPE_CONFIG } from '../../constants';
import type { IconProps } from '../../components/icons';

interface DeviceStatusCardProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  color: string;
  bgColor: string;
  count: number;
  typeCounts: Record<DeviceType, number>;
  onMainCountClick: () => void;
  onTypeCountClick: (type: DeviceType) => void;
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

export const DeviceStatusCard: React.FC<DeviceStatusCardProps> = ({
  icon: Icon,
  label,
  color,
  bgColor,
  count,
  typeCounts,
  onMainCountClick,
  onTypeCountClick,
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
          <button
            type="button"
            title="按该状态筛选设备列表"
            onClick={onMainCountClick}
            style={{ ...countBtnStyle, display: 'block' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${color}22`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ fontSize: '20px', fontWeight: 600, color }}>{count}</span>
          </button>
          <div style={{ fontSize: '12px', color: '#999' }}>{label}</div>
        </div>
      </div>
      <div style={{ height: '1px', backgroundColor: '#f0f0f0', marginBottom: '12px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '8px' }}>
        {Object.entries(typeCounts).map(([type, typeCount]) => (
          <div key={type} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '11px', color: '#999' }}>{TYPE_CONFIG[type as DeviceType]?.label}</div>
            <button
              type="button"
              title="按状态+类型筛选"
              onClick={() => onTypeCountClick(type as DeviceType)}
              style={{ ...countBtnStyle, fontSize: '14px', fontWeight: 500, color: '#333' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(24, 144, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {typeCount}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
