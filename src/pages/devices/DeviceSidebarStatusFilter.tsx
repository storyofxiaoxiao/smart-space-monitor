import { DEVICE_STATUSES } from '../../constants';

type Option = {
  value: string;
  label: string;
  dotColor: string;
  selectedBg: string;
  selectedText: string;
};

const OPTIONS: Option[] = [
  {
    value: 'all',
    label: '全部',
    dotColor: '#bfbfbf',
    selectedBg: '#f0f0f0',
    selectedText: '#262626',
  },
  ...(
    Object.entries(DEVICE_STATUSES) as [keyof typeof DEVICE_STATUSES, (typeof DEVICE_STATUSES)[keyof typeof DEVICE_STATUSES]][]
  ).map(([value, cfg]) => {
    const selectedText =
      value === 'offline'
        ? '#434343'
        : value === 'normal'
          ? '#237804'
          : value === 'warning'
            ? '#ad6800'
            : '#cf1322';
    return {
      value,
      label: cfg.label,
      dotColor: cfg.color,
      selectedBg: cfg.bgColor,
      selectedText,
    };
  }),
];

const IDLE_TEXT = '#595959';
const HOVER_BG = '#fafafa';

interface DeviceSidebarStatusFilterProps {
  value: string;
  onChange: (status: string) => void;
}

export function DeviceSidebarStatusFilter({ value, onChange }: DeviceSidebarStatusFilterProps) {
  return (
    <div>
      <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '10px', fontWeight: 500 }}>状态筛选</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                borderRadius: '6px',
                border: selected ? `1px solid ${opt.dotColor}40` : '1px solid transparent',
                cursor: 'pointer',
                fontSize: '13px',
                lineHeight: 1.35,
                backgroundColor: selected ? opt.selectedBg : 'transparent',
                color: selected ? opt.selectedText : IDLE_TEXT,
                fontWeight: selected ? 600 : 400,
                transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.backgroundColor = HOVER_BG;
                  e.currentTarget.style.color = '#262626';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = IDLE_TEXT;
                }
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: opt.dotColor,
                  flexShrink: 0,
                  boxShadow: selected ? `0 0 0 2px ${opt.selectedBg}, 0 0 0 3px ${opt.dotColor}55` : 'none',
                }}
                aria-hidden
              />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
