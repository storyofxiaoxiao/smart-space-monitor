import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '../../components/icons';
import { DEVICE_STATUSES } from '../../constants';

interface StatusFilterProps {
  selectedStatus: string;
  onSelect: (status: string) => void;
}

export function StatusFilter({ selectedStatus, onSelect }: StatusFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = [
    { value: 'all', label: '全部', color: '#999' },
    ...Object.entries(DEVICE_STATUSES).map(([key, config]) => ({
      value: key,
      label: config.label,
      color: config.color,
    })),
  ];

  const selectedOption = statusOptions.find((opt) => opt.value === selectedStatus) || statusOptions[0];

  return (
    <div ref={dropdownRef} style={{ display: 'inline-block', position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid #d9d9d9',
          backgroundColor: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#333',
          minWidth: '100px',
        }}
      >
        <span style={{ color: '#666', fontSize: '13px' }}>状态:</span>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: selectedOption.color,
          }}
        />
        <span>{selectedOption.label}</span>
        <ChevronDownIcon
          size={14}
          color="#666"
          style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            padding: '4px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #f0f0f0',
            zIndex: 100,
            minWidth: '120px',
          }}
        >
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedStatus === option.value ? '#f0f5ff' : 'transparent',
                color: '#333',
                fontSize: '14px',
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
          ))}
        </div>
      )}
    </div>
  );
}