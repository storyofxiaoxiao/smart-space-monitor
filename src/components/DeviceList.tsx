import { useState, useEffect } from 'react';
import { SearchIcon, FilterIcon, ChevronRightIcon } from '../icons';
import { DEVICE_STATUSES, DEVICE_TYPES } from '../constants';
import { deviceApi } from '../api';
import type { Device } from '../types';
import { DeviceDetail } from './DeviceDetail';

interface DeviceListProps {
  buildingId: string;
  statusFilter: string;
}

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
            <option value="all">全部类型</option>
            {Object.entries(DEVICE_TYPES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>设备名称</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>楼层</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>类型</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>状态</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => {
                const status = DEVICE_STATUSES[device.status] || { label: device.status, color: '#999', bgColor: '#f5f5f5' };
                const type = DEVICE_TYPES[device.type] || { label: device.type, color: '#999' };
                return (
                  <tr
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fafafa';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 500 }}>{device.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{buildingId}-{formatFloor(device.floor)}</td>
                    <td style={{ padding: '12px 16px' }}>{type.label}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: status.bgColor,
                          color: status.color,
                          fontSize: '12px',
                        }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDevice(device);
                        }}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '4px',
                          border: '1px solid #d9d9d9',
                          backgroundColor: '#fff',
                          color: '#1890ff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        查看详情
                        <ChevronRightIcon size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
