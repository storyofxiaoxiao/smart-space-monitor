import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deviceApi } from '../index';

describe('deviceApi', () => {
  const mockDevices = [
    {
      id: 'elevator_001',
      name: '电梯_001',
      type: 'elevator' as const,
      typeName: '电梯',
      buildingId: 'B1',
      floor: 8,
      status: 'normal' as const,
      lastUpdated: '2026-04-15T14:32:00Z',
    },
  ];

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getAll should fetch devices with correct parameters', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDevices,
    });

    const result = await deviceApi.getAll({ buildingId: 'B1', status: 'normal' });

    expect(global.fetch).toHaveBeenCalledWith('/api/devices?buildingId=B1&status=normal', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockDevices);
  });

  it('getById should fetch single device', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDevices[0],
    });

    const result = await deviceApi.getById('elevator_001');

    expect(global.fetch).toHaveBeenCalledWith('/api/devices/elevator_001', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockDevices[0]);
  });

  it('should throw error when response is not ok', async () => {
    (global.fetch as vi.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Not Found', message: 'Device not found' }),
    });

    await expect(deviceApi.getById('invalid_id')).rejects.toThrow('Device not found');
  });
});
