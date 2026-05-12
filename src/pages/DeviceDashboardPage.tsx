import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import { ApartmentIcon } from '../icons';
import { BuildingSelector } from '../components/BuildingSelector';
import { DeviceSidebarStatusFilter } from '../components/DeviceSidebarStatusFilter';
import { DeviceStats } from '../components/DeviceStats';
import { DeviceList } from '../components/DeviceList';
import { deviceApi } from '../api';
import type { Device } from '../types';

export function DeviceDashboardPage() {
  const [selectedBuilding, setSelectedBuilding] = useState('B1');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [devices, setDevices] = useState<Device[]>([]);

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

  const gutter = 3;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        gap: 2,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        component="aside"
        sx={{
          width: 200,
          flexShrink: 0,
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          pl: gutter,
          pt: gutter,
          pb: gutter,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
            px: '20px',
            pt: '16px',
            pb: '16px',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, mb: 1.5 }}>
            <ApartmentIcon size={16} color="#666" />
            <Box component="span" sx={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
              楼栋
            </Box>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.5 }}>
            <BuildingSelector
              selectedBuilding={selectedBuilding}
              onSelect={setSelectedBuilding}
              showHeading={false}
            />
          </Box>
          <Box sx={{ flexShrink: 0, pt: 2, mt: 0, borderTop: '1px solid #f0f0f0' }}>
            <DeviceSidebarStatusFilter value={statusFilter} onChange={setStatusFilter} />
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          pr: gutter,
          pt: gutter,
          pb: gutter,
        }}
      >
        <DeviceStats
          devices={devices}
          onPickType={(t) => setTypeFilter(t)}
          onPickStatus={(s) => setStatusFilter(s)}
        />
        <DeviceList
          buildingId={selectedBuilding}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
        />
      </Box>
    </Box>
  );
}
