import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import { ApartmentIcon } from '../../components/icons';
import { BuildingSelector } from './BuildingSelector';
import { DeviceSidebarStatusFilter } from './DeviceSidebarStatusFilter';
import { DeviceStats } from './DeviceStats';
import { DeviceList } from './DeviceList';
import { deviceApi } from '../../api';
import type { Device } from '../../types';

/** 单条楼栋按钮约高（padding + margin + 一行字） */
const BUILDING_ROW_APPROX_PX = 44;
const MIN_BUILDING_VISIBLE_ROWS = 3;

/** 视口过窄时外层横向滚动；用 matchMedia 避免 innerWidth 随滚动条出现/消失抖动 */
const NARROW_VIEWPORT_MQ = '(max-width: 519px)';
/** 并排时的最小内容宽（侧栏 200 + gap + 主区可读下限），用于撑出横向滚动条 */
const DASHBOARD_ROW_MIN_WIDTH = 200 + 16 + 300;

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

  const [outerScrollX, setOuterScrollX] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(NARROW_VIEWPORT_MQ).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(NARROW_VIEWPORT_MQ);
    const apply = () => setOuterScrollX(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  /** 侧栏白卡：用于在「紧凑纵向」判断里计算理论楼栋槽位（与 flex 子项当前分配无关，避免抖动） */
  const sidebarCardRef = useRef<HTMLDivElement>(null);
  const sidebarHeaderRef = useRef<HTMLDivElement>(null);
  const sidebarStatusRef = useRef<HTMLDivElement>(null);
  const [verticalCompact, setVerticalCompact] = useState(false);

  const recomputeVerticalCompact = useCallback(() => {
    const card = sidebarCardRef.current;
    const header = sidebarHeaderRef.current;
    const status = sidebarStatusRef.current;
    if (!card || !header || !status) return;

    const cs = getComputedStyle(card);
    const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const headerMb = parseFloat(getComputedStyle(header).marginBottom) || 0;
    const listSlot =
      card.clientHeight - padY - header.offsetHeight - headerMb - status.offsetHeight;
    const minNeed = BUILDING_ROW_APPROX_PX * MIN_BUILDING_VISIBLE_ROWS;
    setVerticalCompact(listSlot < minNeed);
  }, []);

  useLayoutEffect(() => {
    recomputeVerticalCompact();
    const ro = new ResizeObserver(() => recomputeVerticalCompact());
    const card = sidebarCardRef.current;
    const status = sidebarStatusRef.current;
    const header = sidebarHeaderRef.current;
    if (card) ro.observe(card);
    if (status) ro.observe(status);
    if (header) ro.observe(header);
    window.addEventListener('resize', recomputeVerticalCompact);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recomputeVerticalCompact);
    };
  }, [recomputeVerticalCompact]);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        overflowX: outerScrollX ? 'auto' : 'hidden',
        overflowY: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          minHeight: 0,
          height: '100%',
          minWidth: outerScrollX ? DASHBOARD_ROW_MIN_WIDTH : 0,
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
            ref={sidebarCardRef}
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              bgcolor: '#fff',
              borderRadius: '12px',
              border: '1px solid #f0f0f0',
              px: '20px',
              pt: '16px',
              pb: '16px',
              overflowX: 'hidden',
              overflowY: verticalCompact ? 'auto' : 'hidden',
            }}
          >
            <Box ref={sidebarHeaderRef} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, mb: 1.5 }}>
              <ApartmentIcon size={16} color="#666" />
              <Box component="span" sx={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
                楼栋
              </Box>
            </Box>
            <Box
              sx={{
                flex: verticalCompact ? 'none' : 1,
                minHeight: verticalCompact ? 'auto' : 0,
                overflowY: verticalCompact ? 'visible' : 'auto',
                pr: 0.5,
              }}
            >
              <BuildingSelector
                selectedBuilding={selectedBuilding}
                onSelect={setSelectedBuilding}
                showHeading={false}
              />
            </Box>
            <Box ref={sidebarStatusRef} sx={{ flexShrink: 0, pt: 2, mt: 0, borderTop: '1px solid #f0f0f0' }}>
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
    </Box>
  );
}
