import { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon } from '../icons';
import { deviceApi } from '../api';
import type { Device } from '../types';
import { DeviceDetail } from './DeviceDetail';

interface DeviceListProps {
  buildingId: string;
  statusFilter: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  normal: { label: '正常', color: '#52c41a', bgColor: '#f6ffed' },
  warning: { label: '告警', color: '#faad14', bgColor: '#fffbe6' },
  fault: { label: '故障', color: '#ff4d4f', bgColor: '#fff2f0' },
  offline: { label: '离线', color: '#d9d9d9', bgColor: '#fafafa' },
};

const TYPE_LABELS: Record<string, string> = {
  elevator: '电梯',
  hvac: '空调',
  pump: '水泵',
  lighting: '照明',
  fire_pressure: '消防',
};

const TYPE_OPTIONS = [
  { value: 'all', label: '全部类型' },
  { value: 'elevator', label: '电梯' },
  { value: 'hvac', label: '空调' },
  { value: 'pump', label: '水泵' },
  { value: 'lighting', label: '照明' },
  { value: 'fire_pressure', label: '消防' },
];

export function DeviceList({ buildingId, statusFilter }: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = { buildingId };
        if (statusFilter !== 'all') params.status = statusFilter;
        if (typeFilter !== 'all') params.type = typeFilter;

        const data = await deviceApi.getAll(params);
        setDevices(data);
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [buildingId, statusFilter, typeFilter]);

  const filteredDevices = devices.filter((device) =>
    device.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatFloor = (floor: number) => {
    if (floor < 0) return `B${Math.abs(floor)}`;
    return `${floor}F`;
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <SearchIcon size={16} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="搜索设备名称..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 40px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              fontSize: '14px',
            }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <FilterIcon size={16} color="#999" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '8px 32px 8px 40px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>加载中...</div>
      ) : filteredDevices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无设备</div>
      ) : (
        <div style={{ border: '1px solid #e8e8e8', borderRadius: '8px', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              padding: '12px 16px',
              backgroundColor: '#fafafa',
              borderBottom: '1px solid #e8e8e8',
              fontWeight: 500,
              color: '#666',
              fontSize: '14px',
            }}
          >
            <span style={{ flex: 2 }}>设备名称</span>
            <span style={{ flex: 1 }}>楼层</span>
            <span style={{ flex: 1 }}>类型</span>
            <span style={{ flex: 1 }}>状态</span>
          </div>
          {filteredDevices.map((device) => {
            const status = STATUS_LABELS[device.status];
            return (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                style={{
                  display: 'flex',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                }}
              >
                <span style={{ flex: 2, fontWeight: 500 }}>{device.name}</span>
                <span style={{ flex: 1 }}>{buildingId}-{formatFloor(device.floor)}</span>
                <span style={{ flex: 1 }}>{TYPE_LABELS[device.type]}</span>
                <span
                  style={{
                    flex: 1,
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: status.bgColor,
                    color: status.color,
                    fontSize: '12px',
                    textAlign: 'center',
                  }}
                >
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {selectedDevice && (
        <DeviceDetail
          device={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}
