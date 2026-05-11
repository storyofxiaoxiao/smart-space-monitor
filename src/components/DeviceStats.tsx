import { ElevatorIcon, AirIcon, DropletsIcon, LightbulbIcon, ShieldIcon } from '../icons';
import type { Device } from '../types';

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

export function DeviceStats({ devices }: DeviceStatsProps) {
  const stats = Object.entries(TYPE_CONFIG).map(([type, config]) => ({
    ...config,
    count: devices.filter((d) => d.type === type).length,
  }));

  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
      {stats.map(({ icon: Icon, label, color, count }) => (
        <div
          key={label}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: '#fff',
            border: '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={24} color={color} />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: '#333' }}>{count}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
