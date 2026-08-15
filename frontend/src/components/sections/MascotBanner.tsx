import React from 'react';
import { useToast } from '../../context/ToastContext';

export const MascotBanner: React.FC = () => {
  const { showToast } = useToast();

  const mascots = [
    {
      name: 'The Happy Hacker',
      emoji: '😊',
      color: '#08B74F',
      svg: (
        <svg width="36" height="36" viewBox="0 0 32 32">
          <path d="M8 18 Q16 27 24 18" stroke="#08B74F" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <rect x="7" y="9" width="4" height="4" fill="#08B74F"/>
          <rect x="21" y="9" width="4" height="4" fill="#08B74F"/>
        </svg>
      )
    },
    {
      name: 'The Systems Master',
      emoji: '😉',
      color: '#2B7FFF',
      svg: (
        <svg width="36" height="36" viewBox="0 0 32 32">
          <path d="M8 18 Q16 27 24 18" stroke="#2B7FFF" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M7 11 Q10 7 13 11" stroke="#2B7FFF" strokeWidth="2.5" fill="none"/>
          <rect x="20" y="9" width="4" height="4" fill="#2B7FFF"/>
        </svg>
      )
    },
    {
      name: 'The Vibe Coder',
      emoji: '🎧',
      color: '#F5C040',
      svg: (
        <svg width="36" height="36" viewBox="0 0 32 32">
          <path d="M8 18 Q16 27 24 18" stroke="#F5C040" strokeWidth="3" strokeLinecap="round" fill="none"/>
          <path d="M7 11 Q10 7 13 11" stroke="#F5C040" strokeWidth="2.5" fill="none"/>
          <path d="M19 11 Q22 7 25 11" stroke="#F5C040" strokeWidth="2.5" fill="none"/>
        </svg>
      )
    },
    {
      name: 'The Kernel Debugger',
      emoji: '⚡',
      color: '#E84A36',
      svg: (
        <svg width="36" height="36" viewBox="0 0 32 32">
          <line x1="8" y1="20" x2="24" y2="20" stroke="#E84A36" strokeWidth="3" strokeLinecap="round"/>
          <rect x="7" y="9" width="5" height="5" fill="#E84A36"/>
          <rect x="20" y="9" width="5" height="5" fill="#E84A36"/>
        </svg>
      )
    }
  ];

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="mascot-banner">
          <div>
            <div className="section-tag">// COMMUNITY SPIRIT</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>Pick your Club Vibe Mascot</h3>
            <p style={{ fontSize: '0.95rem', maxWidth: '460px' }}>
              Every member has a unique style. Click on our brand mascots to interact with them!
            </p>
          </div>

          <div className="mascot-faces-row">
            {mascots.map(m => (
              <div
                key={m.name}
                className="mascot-badge"
                title={m.name}
                onClick={() => showToast(`Selected Mascot: ${m.name} ${m.emoji}`, 'success')}
              >
                {m.svg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
