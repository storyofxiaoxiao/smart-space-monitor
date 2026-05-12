import { useState } from 'react';
import { MonitorIcon, ElevatorIcon, AirIcon, DropletsIcon, LightbulbIcon, ShieldIcon, CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon, WifiOffIcon } from '../icons';
import { DEVICE_STATUSES } from '../constants';
import type { Device, DeviceStatus, DeviceType } from '../types';
import { DeviceTypeCard } from './DeviceTypeCard';
import { DeviceStatusCard } from './DeviceStatusCard';

interface DeviceStatsProps {
  devices: Device[];
  onPickType: (type: DeviceType | 'all') => void;
  onPickStatus: (status: DeviceStatus | 'all') => void;
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

export function DeviceStats({ devices, onPickType, onPickStatus }: DeviceStatsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('type');

  const totalCount = devices.length;

  const getStatsByType = () => {
    return (Object.keys(TYPE_CONFIG) as DeviceType[]).map((typeKey) => {
      const config = TYPE_CONFIG[typeKey];
      const typeDevices = devices.filter((d) => d.type === typeKey);
      const statusCounts = Object.keys(DEVICE_STATUSES).reduce((acc, status) => {
        acc[status as DeviceStatus] = typeDevices.filter((d) => d.status === status).length;
        return acc;
      }, {} as Record<DeviceStatus, number>);
      return { typeKey, ...config, count: typeDevices.length, statusCounts };
    });
  };

  const getStatsByStatus = () => {
    return (Object.keys(STATUS_CONFIG) as DeviceStatus[]).map((statusKey) => {
      const config = STATUS_CONFIG[statusKey];
      const statusDevices = devices.filter((d) => d.status === statusKey);
      const typeCounts = (Object.keys(TYPE_CONFIG) as DeviceType[]).reduce((acc, type) => {
        acc[type] = statusDevices.filter((d) => d.type === type).length;
        return acc;
      }, {} as Record<DeviceType, number>);
      return { statusKey, ...config, count: statusDevices.length, typeCounts };
    });
  };

  const statsByType = getStatsByType();
  const statsByStatus = getStatsByStatus();

  const warningCount = devices.filter((d) => d.status === 'warning').length;
  const faultCount = devices.filter((d) => d.status === 'fault').length;
  const hasIssues = warningCount > 0 || faultCount > 0;

  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#333' }}>统计概览</h2>
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
                <MonitorIcon size={18} color="#1890ff" />
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
              type="button"
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
              type="button"
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px 12px' }}>
          {viewMode === 'type'
            ? statsByType.map(({ icon: Icon, label, color, count, statusCounts, typeKey }) => (
                <DeviceTypeCard
                  key={typeKey}
                  icon={Icon}
                  label={label}
                  color={color}
                  count={count}
                  statusCounts={statusCounts}
                  onMainCountClick={() => {
                    onPickType(typeKey);
                    onPickStatus('all');
                  }}
                  onStatusCountClick={(status) => {
                    onPickType(typeKey);
                    onPickStatus(status);
                  }}
                />
              ))
            : statsByStatus.map(({ icon: Icon, label, color, bgColor, count, typeCounts, statusKey }) => (
                <DeviceStatusCard
                  key={statusKey}
                  icon={Icon}
                  label={label}
                  color={color}
                  bgColor={bgColor}
                  count={count}
                  typeCounts={typeCounts}
                  onMainCountClick={() => {
                    onPickStatus(statusKey);
                    onPickType('all');
                  }}
                  onTypeCountClick={(type) => {
                    onPickStatus(statusKey);
                    onPickType(type);
                  }}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
