import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeviceAlertPanel } from '../DeviceAlertPanel';

vi.mock('react', () => ({
  ...vi.importActual('react'),
  useEffect: vi.fn(),
}));

describe('DeviceAlertPanel', () => {
  const mockAlerts = [
    {
      id: 'alt_001',
      deviceId: 'dev_001',
      deviceName: '设备_001',
      level: 'warning' as const,
      message: '测试告警消息',
      timestamp: '2026-04-15T14:30:00Z',
      acknowledged: false,
    },
    {
      id: 'alt_002',
      deviceId: 'dev_002',
      deviceName: '设备_002',
      level: 'critical' as const,
      message: '严重告警消息',
      timestamp: '2026-04-15T14:35:00Z',
      acknowledged: true,
    },
  ];

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display alerts correctly', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlerts,
    });

    render(<DeviceAlertPanel buildingId="B1" />);

    await waitFor(() => {
      expect(screen.getByText('设备_001')).toBeInTheDocument();
      expect(screen.getByText('设备_002')).toBeInTheDocument();
    });
  });

  it('should filter alerts by level', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAlerts,
    });

    render(<DeviceAlertPanel buildingId="B1" />);

    await waitFor(() => {
      expect(screen.getByText('设备_001')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'critical' } });

    expect(screen.queryByText('设备_001')).not.toBeInTheDocument();
    expect(screen.getByText('设备_002')).toBeInTheDocument();
  });

  it('should acknowledge alert when button clicked', async () => {
    (global.fetch as vi.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'alt_001', acknowledged: true }),
      });

    render(<DeviceAlertPanel buildingId="B1" />);

    await waitFor(() => {
      expect(screen.getByText('确认')).toBeInTheDocument();
    });

    const acknowledgeBtn = screen.getByText('确认');
    fireEvent.click(acknowledgeBtn);

    expect(global.fetch).toHaveBeenCalledWith('/api/alerts/alt_001/ack', { method: 'POST' });
  });
});
