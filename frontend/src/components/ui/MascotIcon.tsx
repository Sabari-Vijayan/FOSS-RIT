import React from 'react';
import { VibeId } from '../../context/VibeContext';

interface MascotIconProps {
  vibe: VibeId;
  size?: number;
  color?: string;
  className?: string;
}

export const MascotIcon: React.FC<MascotIconProps> = ({ vibe, size = 32, color, className }) => {
  switch (vibe) {
    case 'hacker':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
          <rect width="32" height="32" rx="6" fill={color || '#08B74F'} fillOpacity="0.15" stroke={color || '#08B74F'} strokeWidth="1.5" />
          <path d="M8 18 Q16 27 24 18" stroke={color || '#08B74F'} strokeWidth="3" strokeLinecap="round" />
          <rect x="7" y="9" width="4" height="4" fill={color || '#08B74F'} rx="1" />
          <rect x="21" y="9" width="4" height="4" fill={color || '#08B74F'} rx="1" />
        </svg>
      );
    case 'systems':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
          <rect width="32" height="32" rx="6" fill={color || '#2B7FFF'} fillOpacity="0.15" stroke={color || '#2B7FFF'} strokeWidth="1.5" />
          <path d="M8 18 Q16 27 24 18" stroke={color || '#2B7FFF'} strokeWidth="3" strokeLinecap="round" />
          <path d="M7 11 Q10 7 13 11" stroke={color || '#2B7FFF'} strokeWidth="2.5" strokeLinecap="round" />
          <rect x="20" y="9" width="4" height="4" fill={color || '#2B7FFF'} rx="1" />
        </svg>
      );
    case 'vibe':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
          <rect width="32" height="32" rx="6" fill={color || '#F5C040'} fillOpacity="0.15" stroke={color || '#F5C040'} strokeWidth="1.5" />
          <path d="M8 18 Q16 27 24 18" stroke={color || '#F5C040'} strokeWidth="3" strokeLinecap="round" />
          <path d="M7 11 Q10 7 13 11" stroke={color || '#F5C040'} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M19 11 Q22 7 25 11" stroke={color || '#F5C040'} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'kernel':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" className={className} fill="none">
          <rect width="32" height="32" rx="6" fill={color || '#E84A36'} fillOpacity="0.15" stroke={color || '#E84A36'} strokeWidth="1.5" />
          <line x1="8" y1="20" x2="24" y2="20" stroke={color || '#E84A36'} strokeWidth="3" strokeLinecap="round" />
          <rect x="7" y="9" width="5" height="5" fill={color || '#E84A36'} rx="1" />
          <rect x="20" y="9" width="5" height="5" fill={color || '#E84A36'} rx="1" />
        </svg>
      );
    default:
      return null;
  }
};
