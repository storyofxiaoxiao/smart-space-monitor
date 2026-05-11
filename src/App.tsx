import { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { BotIcon, MonitorIcon, FileTextIcon, ApartmentIcon } from './icons';
import { BuildingSelector } from './components/BuildingSelector';
import { DeviceStats } from './components/DeviceStats';
import { DeviceList } from './components/DeviceList';
import { WorkOrderList } from './components/WorkOrderList';
import { AIAssistant } from './components/AIAssistant';
import { deviceApi } from './api';
import type { Device } from './types';

const Aside = Layout.Sider;

type TabType = 'devices' | 'workOrders';

function App() {
  const [selectedBuilding, setSelectedBuilding] = useState('B1');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<TabType>('devices');
  const [devices, setDevices] = useState<Device[]>([]);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await deviceApi.getAll({ buildingId: selectedBuilding });
        if (!cancelled) setDevices(data);
      } catch (error) {
        console.error('Failed to load devices:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedBuilding]);

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuilding(buildingId);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Aside width={180} style={{ backgroundColor: '#fff', borderRight: '1px solid #e8e8e8', height: '100vh', overflow: 'hidden' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ApartmentIcon size={24} color="#1890ff" />
            <h1 style={{ color: '#333', margin: 0, fontSize: '16px', fontWeight: 600 }}>星汇智慧空间</h1>
          </div>
        </div>
        <div style={{ padding: '16px', height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          <BuildingSelector selectedBuilding={selectedBuilding} onSelect={handleBuildingChange} />
        </div>
      </Aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', flexShrink: 0 }}>
          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            style={{ border: 'none', lineHeight: '64px' }}
            items={[
              {
                key: 'devices',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MonitorIcon size={18} color="#1890ff" />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>设备看板</span>
                  </span>
                ),
                onClick: () => setActiveTab('devices'),
              },
              {
                key: 'workOrders',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileTextIcon size={18} color="#1890ff" />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>工单管理</span>
                  </span>
                ),
                onClick: () => setActiveTab('workOrders'),
              },
            ]}
          />
          <button
            onClick={() => setShowAssistant(!showAssistant)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: showAssistant ? '1px solid #1890ff' : 'none',
              backgroundColor: showAssistant ? 'rgba(24, 144, 255, 0.1)' : '#1890ff',
              color: showAssistant ? '#1890ff' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <BotIcon size={16} />
            {showAssistant ? '关闭 AI' : 'AI 助手'}
          </button>
        </div>

        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {activeTab === 'devices' && (
            <>
              <DeviceStats devices={devices} />
              <DeviceList
                buildingId={selectedBuilding}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
              />
            </>
          )}
          {activeTab === 'workOrders' && <WorkOrderList />}
        </div>
      </div>

      {showAssistant && (
        <Aside width={380} style={{ backgroundColor: '#fff', borderLeft: '1px solid #e8e8e8', height: '100vh', overflow: 'hidden' }}>
          <AIAssistant isOpen={showAssistant} onClose={() => setShowAssistant(false)} />
        </Aside>
      )}
    </div>
  );
}

export default App;