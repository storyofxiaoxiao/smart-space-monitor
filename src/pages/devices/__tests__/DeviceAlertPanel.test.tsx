import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeviceAlertPanel } from '../DeviceAlertPanel';

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
    globalThis.fetch = vi.fn() as typeof fetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display alerts correctly', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockAlerts,
    });

    const { container } = render(<DeviceAlertPanel buildingId="B1" />);

    await waitFor(() => {
      expect(container.textContent).toContain('设备_001');
      expect(container.textContent).toContain('设备_002');
    });
  });

  it('should filter alerts by level', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockAlerts,
    });

    const { container } = render(<DeviceAlertPanel buildingId="B1" />);

    await waitFor(() => {
      expect(container.textContent).toContain('设备_001');
    });

    fireEvent.mouseDown(screen.getByLabelText('告警筛选'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: '严重' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('option', { name: '严重' }));

    expect(screen.queryByText('设备_001')).not.toBeInTheDocument();
    expect(screen.getByText('设备_002')).toBeInTheDocument();
  });

  it('should acknowledge alert when button clicked', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>)
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

    fireEvent.click(screen.getByText('确认'));

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/alerts/alt_001/ack', { method: 'POST' });
  });
});
