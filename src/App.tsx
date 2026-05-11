import { useState } from 'react';
import { Layout, Menu } from 'antd';
import { BotIcon, MonitorIcon, FileTextIcon, ApartmentIcon } from './icons';
import { BuildingSelector } from './components/BuildingSelector';
import { DeviceStats } from './components/DeviceStats';
import { DeviceList } from './components/DeviceList';
import { WorkOrderList } from './components/WorkOrderList';
import { AIAssistant } from './components/AIAssistant';
import { deviceApi } from './api';
import type { Device } from './types';

const { Header, Sider, Content } = Layout;

type TabType = 'devices' | 'workOrders';

function App() {
  const [selectedBuilding, setSelectedBuilding] = useState('B1');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<TabType>('devices');
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [showAssistant, setShowAssistant] = useState(true);

  const loadDevices = async () => {
    setDevicesLoading(true);
    try {
      const data = await deviceApi.getAll({ buildingId: selectedBuilding });
      setDevices(data);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setDevicesLoading(false);
    }
  };

  useState(() => {
    loadDevices();
  });

  const handleBuildingChange = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    loadDevices();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#001529', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ApartmentIcon size={24} color="#fff" />
          <h1 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>星汇智慧空间</h1>
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[activeTab]}
          style={{ backgroundColor: 'transparent', border: 'none' }}
          items={[
            {
              key: 'devices',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MonitorIcon size={16} color="#fff" />
                  设备看板
                </span>
              ),
              onClick: () => setActiveTab('devices'),
            },
            {
              key: 'workOrders',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileTextIcon size={16} color="#fff" />
                  工单管理
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
            borderRadius: '4px',
            border: showAssistant ? '1px solid #1890ff' : 'none',
            backgroundColor: showAssistant ? 'rgba(24, 144, 255, 0.1)' : '#1890ff',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BotIcon size={16} />
          {showAssistant ? '关闭 AI' : 'AI 助手'}
        </button>
      </Header>

      <Layout>
        <Sider width={180} style={{ backgroundColor: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <BuildingSelector selectedBuilding={selectedBuilding} onSelect={handleBuildingChange} />
        </Sider>

        <Content style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
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
        </Content>

        {showAssistant && (
          <Sider
            width={380}
            style={{
              backgroundColor: '#fff',
              borderLeft: '1px solid #f0f0f0',
              overflow: 'auto',
              height: 'calc(100vh - 64px)',
              position: 'relative',
            }}
          >
            <AIAssistant isOpen={showAssistant} onClose={() => setShowAssistant(false)} />
          </Sider>
        )}
      </Layout>
    </Layout>
  );
}

export default App;