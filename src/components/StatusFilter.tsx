import { CircleDotIcon } from '../icons';

interface StatusFilterProps {
  selectedStatus: string;
  onSelect: (status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'normal', label: '正常' },
  { value: 'warning', label: '告警' },
  { value: 'fault', label: '故障' },
  { value: 'offline', label: '离线' },
];

const STATUS_COLORS: Record<string, string> = {
  all: '#999',
  normal: '#52c41a',
  warning: '#faad14',
  fault: '#ff4d4f',
  offline: '#d9d9d9',
};

export function StatusFilter({ selectedStatus, onSelect }: StatusFilterProps) {
  return (
    <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#333' }}>
        <CircleDotIcon size={16} color="#666" style={{ marginRight: '8px' }} />
        状态筛选
      </h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {STATUS_OPTIONS.map((option) => (
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
                  backgroundColor: STATUS_COLORS[option.value],
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
