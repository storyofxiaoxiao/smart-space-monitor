import { lazy, Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const WorkOrderList = lazy(() =>
  import('../components/WorkOrderList').then((m) => ({ default: m.WorkOrderList })),
);

export function WorkOrdersPage() {
  return (
    <Box sx={{ flex: 1, p: 3, overflowY: 'auto', minWidth: 0 }}>
      <Suspense
        fallback={
          <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        }
      >
        <WorkOrderList />
      </Suspense>
    </Box>
  );
}
