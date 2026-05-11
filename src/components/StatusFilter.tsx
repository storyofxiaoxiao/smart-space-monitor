import { CircleDotIcon } from '../icons';
import { DEVICE_STATUSES } from '../constants';

interface StatusFilterProps {
  selectedStatus: string;
  onSelect: (status: string) => void;
}

export function StatusFilter({ selectedStatus, onSelect }: StatusFilterProps) {
  const statusOptions = [
    { value: 'all', label: '全部', color: '#999' },
    ...Object.entries(DEVICE_STATUSES).map(([key, config]) => ({
      value: key,
      label: config.label,
      color: config.color,
    })),
  ];

  return (
    <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
        <CircleDotIcon size={16} color="#666" style={{ marginRight: '8px' }} />
        状态筛选
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {statusOptions.map((option) => (
          <li key={option.value}>
            <button
              onClick={() => onSelect(option.value)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '6px 12px',
                marginBottom: '4px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedStatus === option.value ? '#f0f5ff' : '#fff',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: option.color,
                }}
              />
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
