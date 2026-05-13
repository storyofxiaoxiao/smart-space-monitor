import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { MonitorIcon, FileTextIcon, ApartmentIcon } from './components/icons';
import aiAssistantIconUrl from './assets/icons/ai-chat-icon.svg';
import { DeviceDashboardPage } from './pages/devices/DeviceDashboardPage';
import { UserAccountMenu } from './components/UserAccountMenu';
import { CreateWorkOrderDialogProvider } from './components/CreateWorkOrderDialogContext';

const WorkOrdersPage = lazy(() =>
  import('./pages/work-orders/WorkOrdersPage').then((m) => ({ default: m.WorkOrdersPage })),
);
const AIAssistant = lazy(() =>
  import('./components/AIAssistant').then((m) => ({ default: m.AIAssistant })),
);

export const ROUTES = {
  devices: '/devices',
  workOrders: '/work-orders',
} as const;

function AppShell() {
  const [showAssistant, setShowAssistant] = useState(false);
  const { pathname } = useLocation();
  const tabValue = pathname.startsWith(ROUTES.workOrders) ? ROUTES.workOrders : ROUTES.devices;

  return (
    <CreateWorkOrderDialogProvider>
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        <Box
          sx={{
            bgcolor: '#fff',
            borderBottom: '1px solid #e8e8e8',
            px: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: 64,
            flexShrink: 0,
          }}
        >
          <Box
            component={Link}
            to={ROUTES.devices}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexShrink: 0,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <ApartmentIcon size={24} color="#1890ff" />
            <Box component="h1" sx={{ color: '#333', m: 0, fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap' }}>
              星汇智慧空间
            </Box>
          </Box>
          <Tabs
            value={tabValue}
            sx={{
              minHeight: 64,
              '& .MuiTab-root': {
                minHeight: 64,
                py: 0,
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: '#333',
              },
              '& .Mui-selected': { color: '#1890ff' },
              '& .MuiTabs-indicator': { bgcolor: '#1890ff', height: 2 },
            }}
          >
            <Tab
              value={ROUTES.devices}
              component={Link}
              to={ROUTES.devices}
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MonitorIcon size={18} color={tabValue === ROUTES.devices ? '#1890ff' : '#666'} />
                  设备看板
                </Box>
              }
            />
            <Tab
              value={ROUTES.workOrders}
              component={Link}
              to={ROUTES.workOrders}
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FileTextIcon size={18} color={tabValue === ROUTES.workOrders ? '#1890ff' : '#666'} />
                  工单管理
                </Box>
              }
            />
          </Tabs>
          <Box sx={{ flex: 1, minWidth: 0 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <UserAccountMenu />
          </Box>
          <Button
            variant="contained"
            onClick={() => setShowAssistant(!showAssistant)}
            sx={{
              bgcolor: '#141414',
              color: '#fff',
              textTransform: 'none',
              px: 2,
              py: 1,
              borderRadius: '6px',
              boxShadow: 'none',
              border: showAssistant ? '1px solid #141414' : 'none',
              '&:hover': { bgcolor: '#2a2a2a', boxShadow: 'none' },
            }}
            startIcon={
              <img src={aiAssistantIconUrl} alt="" width={16} height={16} style={{ display: 'block' }} />
            }
          >
            {showAssistant ? '收起 AI' : 'AI 助手'}
          </Button>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Navigate to={ROUTES.devices} replace />} />
            <Route path={ROUTES.devices} element={<DeviceDashboardPage />} />
            <Route path={ROUTES.workOrders} element={<WorkOrdersPage />} />
            <Route path="*" element={<Navigate to={ROUTES.devices} replace />} />
          </Routes>
        </Box>
      </Box>

      {showAssistant && (
        <Box
          component="aside"
          sx={{
            width: 360,
            flexShrink: 0,
            bgcolor: '#fff',
            borderLeft: '1px solid #e8e8e8',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Suspense
            fallback={
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress size={28} />
              </Box>
            }
          >
            <AIAssistant isOpen={showAssistant} onClose={() => setShowAssistant(false)} />
          </Suspense>
        </Box>
      )}
    </Box>
    </CreateWorkOrderDialogProvider>
  );
}

export default function App() {
  return <AppShell />;
}
