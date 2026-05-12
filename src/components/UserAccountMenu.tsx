import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ChevronDownIcon } from '../icons';

/** 顶栏演示用：假登录用户与下拉项（无真实鉴权） */
export function UserAccountMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="用户菜单"
        aria-expanded={open}
        aria-haspopup="true"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          border: 'none',
          bgcolor: 'transparent',
          borderRadius: '8px',
          px: 0.75,
          py: 0.5,
          font: 'inherit',
          color: 'inherit',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: '#1890ff' }} alt="张伟">
          张
        </Avatar>
        <ChevronDownIcon size={16} color="#666" />
      </Box>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
          }}
        >
          设置
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
          }}
        >
          退出
        </MenuItem>
      </Menu>
    </>
  );
}
