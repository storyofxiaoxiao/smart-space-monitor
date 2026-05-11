import { useState } from 'react';
import { MonitorIcon } from '../icons';
import { DEVICE_STATUSES } from '../constants';
import type { Device } from '../types';
import { DeviceTypeCard } from './DeviceTypeCard';
import { DeviceStatusCard } from './DeviceStatusCard';

interface DeviceStatsProps {
  devices: Device[];
}

const TYPE_CONFIG: Record<string, { icon: typeof ElevatorIcon; label: string; color: string }> = {
  elevator: { icon: ElevatorIcon, label: '电梯', color: '#1890ff' },
  hvac: { icon: AirIcon, label: '空调', color: '#52c41a' },
  pump: { icon: DropletsIcon, label: '水泵', color: '#722ed1' },
  lighting: { icon: LightbulbIcon, label: '照明', color: '#faad14' },
  fire_pressure: { icon: ShieldIcon, label: '消防', color: '#ff4d4f' },
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircleIcon; label: string; color: string; bgColor: string }> = {
  normal: { icon: CheckCircleIcon, label: '正常', color: '#52c41a', bgColor: '#f6ffed' },
  warning: { icon: AlertTriangleIcon, label: '告警', color: '#faad14', bgColor: '#fffbe6' },
  fault: { icon: AlertCircleIcon, label: '故障', color: '#ff4d4f', bgColor: '#fff2f0' },
  offline: { icon: WifiOffIcon, label: '离线', color: '#d9d9d9', bgColor: '#fafafa' },
};

type ViewMode = 'type' | 'status';

export function DeviceStats({ devices }: DeviceStatsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('type');

  const totalCount = devices.length;

  const getStatsByType = () => {
    return Object.entries(TYPE_CONFIG).map(([type, config]) => {
      const typeDevices = devices.filter((d) => d.type === type);
      const statusCounts = Object.entries(DEVICE_STATUSES).reduce((acc, [status]) => {
        acc[status] = typeDevices.filter((d) => d.status === status).length;
        return acc;
      }, {} as Record<string, number>);
      return { ...config, count: typeDevices.length, statusCounts };
    });
  };

  const getStatsByStatus = () => {
    return Object.entries(STATUS_CONFIG).map(([status, config]) => {
      const statusDevices = devices.filter((d) => d.status === status);
      const typeCounts = Object.entries(TYPE_CONFIG).reduce((acc, [type]) => {
        acc[type] = statusDevices.filter((d) => d.type === type).length;
        return acc;
      }, {} as Record<string, number>);
      return { ...config, count: statusDevices.length, typeCounts };
    });
  };

  const statsByType = getStatsByType();
  const statsByStatus = getStatsByStatus();

  const warningCount = devices.filter((d) => d.status === 'warning').length;
  const faultCount = devices.filter((d) => d.status === 'fault').length;
  const hasIssues = warningCount > 0 || faultCount > 0;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '46px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#e6f7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MonitorIcon size={18} color='#1890ff' />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '24px', fontWeight: 600, color: '#333' }}>{totalCount}</div>
                <div style={{ fontSize: '14px', color: '#999' }}>
                  设备总数
                  {hasIssues && (
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#d46b08', marginLeft: '4px' }}>
                      （{warningCount} 告警 + {faultCount} 故障）
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('type')}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: viewMode === 'type' ? 500 : 400,
                backgroundColor: viewMode === 'type' ? '#fff' : 'transparent',
                color: viewMode === 'type' ? '#1890ff' : '#666',
                boxShadow: viewMode === 'type' ? '0 2px 4px rgba(0, 0, 0, 0.08)' : 'none',
              }}
            >
              类型
            </button>
            <button
              onClick={() => setViewMode('status')}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: viewMode === 'status' ? 500 : 400,
                backgroundColor: viewMode === 'status' ? '#fff' : 'transparent',
                color: viewMode === 'status' ? '#1890ff' : '#666',
                boxShadow: viewMode === 'status' ? '0 2px 4px rgba(0, 0, 0, 0.08)' : 'none',
              }}
            >
              状态
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, calc((100% - 48px) / 5)), 1fr))', gap: '32px 12px' }}>
          {viewMode === 'type' ? (
            statsByType.map(({ icon: Icon, label, color, count, statusCounts }) => (
              <DeviceTypeCard
                key={label}
                icon={Icon}
                label={label}
                color={color}
                count={count}
                statusCounts={statusCounts}
              />
            ))
          ) : (
            statsByStatus.map(({ icon: Icon, label, color, bgColor, count, typeCounts }) => (
              <DeviceStatusCard
                key={label}
                icon={Icon}
                label={label}
                color={color}
                bgColor={bgColor}
                count={count}
                typeCounts={typeCounts}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}