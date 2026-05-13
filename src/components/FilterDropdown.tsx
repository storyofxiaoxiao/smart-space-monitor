import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from './icons';

interface FilterOption {
  value: string;
  label: string;
  color: string;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  minWidth?: number;
}

export function FilterDropdown({ label, options, value, onChange, minWidth = 100 }: FilterDropdownProps) {
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

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={dropdownRef} style={{ display: 'inline-block', position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9',
          backgroundColor: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          minWidth,
        }}
      >
        <span style={{ color: '#666', fontSize: '13px' }}>{label}:</span>
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
            right: 0,
            marginTop: '4px',
            padding: '4px',
            backgroundColor: '#fff',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #f0f0f0',
            zIndex: 100,
            minWidth,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: value === option.value ? '#f0f5ff' : 'transparent',
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