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
    globalThis.fetch = vi.fn() as typeof fetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getAll should omit absent optional params (avoid type=undefined on server)', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await deviceApi.getAll({ buildingId: 'B3', status: 'fault' });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/devices?buildingId=B3&status=fault', {
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('getAll should fetch devices with correct parameters', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDevices,
    });

    const result = await deviceApi.getAll({ buildingId: 'B1', status: 'normal' });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/devices?buildingId=B1&status=normal', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockDevices);
  });

  it('getById should fetch single device', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDevices[0],
    });

    const result = await deviceApi.getById('elevator_001');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/devices/elevator_001', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result).toEqual(mockDevices[0]);
  });

  it('should throw error when response is not ok', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Not Found', message: 'Device not found' }),
    });

    await expect(deviceApi.getById('invalid_id')).rejects.toThrow('Device not found');
  });
});
