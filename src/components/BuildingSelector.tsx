import { useState, useEffect } from 'react';
import { ApartmentIcon } from '../icons';
import { buildingApi } from '../api';
import type { Building } from '../types';

interface BuildingSelectorProps {
  selectedBuilding: string;
  onSelect: (buildingId: string) => void;
}

export function BuildingSelector({ selectedBuilding, onSelect }: BuildingSelectorProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const data = await buildingApi.getAll();
        setBuildings(data);
      } catch (error) {
        console.error('Failed to fetch buildings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildings();
  }, []);

  if (loading) {
    return <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>加载中...</div>;
  }

  return (
    <div >
      <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#333', display: 'flex', alignItems: 'center' }}>
        <ApartmentIcon size={16} color="#666" style={{ marginRight: '8px' }} />
        楼栋
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {buildings.map((building) => (
          <li key={building.id}>
            <button
              onClick={() => onSelect(building.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 12px',
                marginBottom: '4px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedBuilding === building.id ? '#1890ff' : '#fff',
                color: selectedBuilding === building.id ? '#fff' : '#333',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (selectedBuilding !== building.id) {
                  e.currentTarget.style.backgroundColor = '#f0f5ff';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedBuilding !== building.id) {
                  e.currentTarget.style.backgroundColor = '#fff';
                }
              }}
            >
              <span style={{ fontWeight: selectedBuilding === building.id ? 500 : 400 }}>
                {building.name}
              </span>
              <span
                style={{
                  float: 'right',
                  fontSize: '12px',
                  opacity: selectedBuilding === building.id ? 0.8 : 0.6,
                }}
              >
                {building.deviceCount}台
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
