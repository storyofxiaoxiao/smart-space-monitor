import { useState, useEffect } from 'react';
import { XIcon, AlertTriangleIcon, ClockCircleIcon } from '../../components/icons';
import { DEVICE_STATUSES, ALERT_LEVELS, getStatusConfig } from '../../constants';
import { deviceApi } from '../../api';
import type { Device } from '../../types';

interface DeviceDetailProps {
  device: Device;
  onClose: () => void;
  onCreateWorkOrder?: (deviceId: string) => void;
}

export function DeviceDetail({ device, onClose, onCreateWorkOrder }: DeviceDetailProps) {
  const [deviceWithAlerts, setDeviceWithAlerts] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeviceDetail = async () => {
      try {
        const data = await deviceApi.getById(device.id);
        setDeviceWithAlerts(data);
      } catch (error) {
        console.error('Failed to fetch device detail:', error);
        setDeviceWithAlerts(device);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceDetail();
  }, [device.id, device]);

  const status = getStatusConfig(DEVICE_STATUSES, device.status);

  const formatFloor = (floor: number) => {
    if (floor < 0) return `地下${Math.abs(floor)}层`;
    return `${floor}层`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '560px',
          maxWidth: '96vw',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              {device.name}
            </h2>
            <span style={{ fontSize: '12px', color: '#999' }}>
              {device.buildingId} - {formatFloor(device.floor)}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <XIcon size={14} color="#666" />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>加载中...</div>
        ) : (
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>类型</div>
                <div style={{ fontWeight: 500 }}>{device.typeName}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>状态</div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: status.bgColor,
                    color: status.color,
                    fontSize: '12px',
                  }}
                >
                  {status.label}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>最后更新</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  <ClockCircleIcon size={12} color="#999" />
                  {formatTime(device.lastUpdated)}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                <AlertTriangleIcon size={16} color="#faad14" style={{ marginRight: '8px' }} />
                最近告警
              </h3>
              <div style={{ overflowX: 'auto', maxHeight: '240px', overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fafafa' }}>
                      <th
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          borderBottom: '1px solid #e8e8e8',
                          fontWeight: 500,
                          color: '#666',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          width: 72,
                        }}
                      >
                        级别
                      </th>
                      <th
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          borderBottom: '1px solid #e8e8e8',
                          fontWeight: 500,
                          color: '#666',
                          fontSize: '12px',
                        }}
                      >
                        告警内容
                      </th>
                      <th
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          borderBottom: '1px solid #e8e8e8',
                          fontWeight: 500,
                          color: '#666',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          width: 130,
                        }}
                      >
                        时间
                      </th>
                      <th
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          borderBottom: '1px solid #e8e8e8',
                          fontWeight: 500,
                          color: '#666',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                          width: 72,
                        }}
                      >
                        确认
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviceWithAlerts?.alerts && deviceWithAlerts.alerts.length > 0 ? (
                      [...deviceWithAlerts.alerts]
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((alert) => {
                          const level = ALERT_LEVELS[alert.level] || { label: alert.level, color: '#999' };
                          return (
                            <tr key={alert.id} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
                              <td style={{ padding: '10px', verticalAlign: 'top' }}>
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: level.color,
                                    backgroundColor: `${level.color}18`,
                                    fontWeight: 500,
                                  }}
                                >
                                  {level.label}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: '10px',
                                  verticalAlign: 'top',
                                  color: '#333',
                                  lineHeight: 1.45,
                                  wordBreak: 'break-word',
                                }}
                              >
                                {alert.message}
                              </td>
                              <td style={{ padding: '10px', verticalAlign: 'top', color: '#666', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                {formatTime(alert.timestamp)}
                              </td>
                              <td style={{ padding: '10px', verticalAlign: 'top', fontSize: '12px', color: alert.acknowledged ? '#52c41a' : '#d46b08' }}>
                                {alert.acknowledged ? '已确认' : '待确认'}
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '24px 16px', textAlign: 'center', color: '#999', borderBottom: 'none' }}>
                          暂无告警记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  onCreateWorkOrder?.(device.id);
                  onClose();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#1890ff',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                创建工单
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
