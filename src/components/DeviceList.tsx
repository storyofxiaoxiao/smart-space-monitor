import { useState, useEffect, useMemo } from 'react';
import { SearchIcon, ChevronRightIcon } from '../icons';
import { LIST_PAGE_SIZE, DEVICE_STATUSES, DEVICE_TYPES } from '../constants';
import { ListPaginationBar } from './ListPaginationBar';
import { deviceApi } from '../api';
import type { Device } from '../types';
import { DeviceDetail } from './DeviceDetail';
import { FilterDropdown } from './FilterDropdown';

interface DeviceListProps {
  buildingId: string;
  statusFilter: string;
  typeFilter: string;
  onTypeChange: (type: string) => void;
}

export function DeviceList({
  buildingId,
  statusFilter,
  typeFilter,
  onTypeChange,
}: DeviceListProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [page, setPage] = useState(1);

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

    void fetchDevices();
  }, [buildingId, statusFilter, typeFilter]);

  useEffect(() => {
    setPage(1);
  }, [buildingId, statusFilter, typeFilter, searchText]);

  const filteredDevices = useMemo(
    () => devices.filter((device) => device.name.toLowerCase().includes(searchText.toLowerCase())),
    [devices, searchText],
  );

  const total = filteredDevices.length;
  const pageCount = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
  useEffect(() => {
    setPage((prev) => Math.min(prev, pageCount));
  }, [pageCount]);

  const safePage = Math.min(page, pageCount);
  const pagedDevices = filteredDevices.slice((safePage - 1) * LIST_PAGE_SIZE, safePage * LIST_PAGE_SIZE);

  const formatFloor = (floor: number) => {
    if (floor < 0) return `B${Math.abs(floor)}`;
    return `${floor}F`;
  };

  const typeOptions = [
    { value: 'all', label: '全部', color: '#999' },
    ...Object.entries(DEVICE_TYPES).map(([key, config]) => ({
      value: key,
      label: config.label,
      color: config.color,
    })),
  ];

  const thead = (
    <thead>
      <tr style={{ backgroundColor: '#fafafa' }}>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>
          设备名称
        </th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>楼层</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>类型</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>状态</th>
        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', fontWeight: 500, color: '#666', fontSize: '14px' }}>操作</th>
      </tr>
    </thead>
  );

  return (
    <div>
      <h2 style={{ margin: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: '#333' }}>设备列表</h2>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', width: '280px', minWidth: '200px', flex: '0 1 280px' }}>
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

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterDropdown label="类型" options={typeOptions} value={typeFilter} onChange={onTypeChange} minWidth={110} />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          {thead}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                  加载中...
                </td>
              </tr>
            ) : filteredDevices.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                  暂无设备
                </td>
              </tr>
            ) : (
              pagedDevices.map((device) => {
                const status = DEVICE_STATUSES[device.status] || { label: device.status, color: '#999', bgColor: '#f5f5f5' };
                const type = DEVICE_TYPES[device.type] || { label: device.type, color: '#999' };
                return (
                  <tr
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    style={{
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background-color 0.2s',
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
                    <td style={{ padding: '12px 16px' }}>
                      {buildingId}-{formatFloor(device.floor)}
                    </td>
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
                        type="button"
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
              })
            )}
          </tbody>
        </table>
      </div>

      <ListPaginationBar total={total} page={page} pageSize={LIST_PAGE_SIZE} onPageChange={setPage} />

      {selectedDevice && <DeviceDetail device={selectedDevice} onClose={() => setSelectedDevice(null)} />}
    </div>
  );
}
