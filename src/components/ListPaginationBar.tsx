import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';

interface ListPaginationBarProps {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function ListPaginationBar({ total, page, pageSize, onPageChange }: ListPaginationBarProps) {
  if (total <= 0) return null;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        mt: 2,
      }}
    >
      <Box component="span" sx={{ fontSize: 13, color: 'text.secondary' }}>
        共 {total} 条，第 {from}–{to} 条
      </Box>
      <Pagination
        count={pageCount}
        page={safePage}
        onChange={(_, p) => onPageChange(p)}
        color="primary"
        size="small"
        showFirstButton
        showLastButton
        siblingCount={1}
      />
    </Box>
  );
}
