import type { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export function BotIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M8 16v1a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1" />
      <line x1="6" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}

export function MonitorIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export function FileTextIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function ApartmentIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 19V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
      <path d="M18 19H6" />
      <path d="M10 15H8" />
      <path d="M14 15H12" />
      <path d="M18 15H16" />
      <path d="M10 11H8" />
      <path d="M14 11H12" />
    </svg>
  );
}

export function SendIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function XIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function ToolIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22.7 17.4a1.2 1.2 0 0 0-.7-1.1L13 12.2V3h-2v9.2l-9 4.1a1.2 1.2 0 0 0-.7 1.1 1.1 1.1 0 0 0 .7 1.5L9 19l3 1.3 3-1.3 8-3.6a1.1 1.1 0 0 0 .7-1.5z" />
    </svg>
  );
}

export function CheckCircleIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 10 10 16 8 14" />
    </svg>
  );
}

export function AlertCircleIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12" y2="16" />
    </svg>
  );
}

export function ClockCircleIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function WrenchIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.71 4.04a1 1 0 0 0-1.42 0l-1.18 1.18-3.54-3.54a1 1 0 0 0-1.42 0l-1.41 1.41 1.46 1.46-1.6 1.6a1 1 0 0 0 0 1.41l1.41 1.41 1.46-1.46 1.46 1.46-1.41 1.41a1 1 0 0 0 0 1.42l1.6 1.6 1.46-1.46 1.46 1.46 1.41-1.41a1 1 0 0 0 0-1.42l-1.6-1.6 1.46-1.46 1.46 1.46 1.18-1.18a1 1 0 0 0 0-1.42l-2.83-2.83z" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function PlusIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function FilterIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 19 14 12.46 22 3" />
    </svg>
  );
}

export function AlertTriangleIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18.7 7.2a2.5 2.5 0 0 0-1.8-2.4L12 2 7.1 4.8a2.5 2.5 0 0 0-1.8 2.4l-.6 8.7a2.5 2.5 0 0 0 2.2 2.9h11.5a2.5 2.5 0 0 0 2.2-2.9l-.6-8.7z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function SearchIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function ElevatorIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="6" y1="10" x2="18" y2="10" />
      <line x1="6" y1="14" x2="18" y2="14" />
      <rect x="10" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function AirIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M12 12l4-4" />
      <path d="M8 16l4-4" />
      <path d="M16 16l4-4" />
    </svg>
  );
}

export function DropletsIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
      <path d="M8 12l2-2 2 2" />
      <path d="M12 12l2-2 2 2" />
    </svg>
  );
}

export function LightbulbIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5C18 10 20 8 20 8v-2c0-1.1-.9-2-2-2h-8c-1.1 0-2 .9-2 2v2c0 0 2 2 3.5 3.5 1 .8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function ShieldIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 12l4-4" />
      <path d="M12 16l4-4" />
    </svg>
  );
}

export function WifiOffIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.5 10.5a4.5 4.5 0 0 0-9 0 4.97 4.97 0 0 0-2 8.29" />
      <path d="M9.5 14.5a4.5 4.5 0 0 0 9 0 4.97 4.97 0 0 1 2-8.29" />
      <path d="M12 19.93a8 8 0 0 1-7-8 8.5 8.5 0 0 1 15 0 8 8 0 0 1-7 8" />
    </svg>
  );
}

export function SwapHorizontalIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="16 3 21 3 21 8" />
      <polyline points="8 21 3 21 3 16" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="16" x2="10" y2="9" />
    </svg>
  );
}

export function CircleDotIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function LoaderIcon({ size = 20, color = '#666', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
