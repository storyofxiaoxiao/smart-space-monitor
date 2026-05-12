/**
 * DeviceAlertPanel.tsx — 设备告警面板
 *
 * 这个组件展示指定楼栋的设备告警列表，支持按级别筛选、自动刷新和手动确认告警。
 *
 * ✅ 已修复 3 个 bug：
 * 1. fetchAlerts 的 useCallback 依赖数组添加了 buildingId
 * 2. 自动刷新 useEffect 添加了定时器清理
 * 3. handleAcknowledge 使用不可变更新方式
 */

import React, { useState, useEffect, useCallback } from 'react';

interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  level: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface DeviceAlertPanelProps {
  buildingId: string;
  onAlertClick?: (alert: Alert) => void;
}

const LEVEL_COLORS: Record<Alert['level'], string> = {
  critical: '#ff4d4f',
  warning: '#faad14',
  info: '#1890ff',
};

export const DeviceAlertPanel: React.FC<DeviceAlertPanelProps> = ({
  buildingId,
  onAlertClick,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 拉取告警数据
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/alerts?buildingId=${buildingId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Alert[] = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [buildingId]); // ✅ 修复：添加 buildingId 到依赖数组

  // 初始加载 + buildingId 变化时重新加载
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(fetchAlerts, 5000);
      return () => clearInterval(timer); // ✅ 修复：添加定时器清理
    }
  }, [autoRefresh, fetchAlerts]); // ✅ 修复：添加 fetchAlerts 到依赖数组

  // 确认告警
  const handleAcknowledge = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/ack`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // ✅ 修复：使用不可变更新方式，创建新数组
      setAlerts((prevAlerts) =>
        prevAlerts.map((a) =>
          a.id === alertId ? { ...a, acknowledged: true } : a
        )
      );
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  // 按筛选条件过滤
  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'unacknowledged') return !a.acknowledged;
    return a.level === filter;
  });

  return (
    <div style={{ border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>
          设备告警
          <span style={{ fontSize: 14, color: '#999', marginLeft: 8 }}>
            ({filteredAlerts.length})
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '4px 8px' }}
          >
            <option value="all">全部</option>
            <option value="critical">严重</option>
            <option value="warning">警告</option>
            <option value="info">信息</option>
            <option value="unacknowledged">未确认</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            自动刷新
          </label>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', color: '#666', fontWeight: 500 }}>
                设备名称
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', color: '#666', fontWeight: 500 }}>
                告警内容
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', color: '#666', fontWeight: 500 }}>
                时间
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e8e8e8', color: '#666', fontWeight: 500 }}>
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                  加载中...
                </td>
              </tr>
            ) : filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: '#999', borderBottom: '1px solid #f0f0f0' }}>
                  暂无告警
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  onClick={() => onAlertClick?.(alert)}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: alert.acknowledged ? '#fafafa' : '#fff',
                    opacity: alert.acknowledged ? 0.75 : 1,
                    boxShadow: `inset 3px 0 0 0 ${LEVEL_COLORS[alert.level]}`,
                  }}
                >
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{alert.deviceName}</td>
                  <td style={{ padding: '10px 12px', color: '#666' }}>{alert.message}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: '#999', whiteSpace: 'nowrap' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {!alert.acknowledged ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledge(alert.id);
                        }}
                        style={{
                          padding: '2px 8px',
                          fontSize: 12,
                          border: '1px solid #d9d9d9',
                          borderRadius: 4,
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        确认
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#999' }}>已确认</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
