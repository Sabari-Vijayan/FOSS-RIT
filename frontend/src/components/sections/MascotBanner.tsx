import React, { useState } from 'react';
import { useVibe, VIBES, VibeId } from '../../context/VibeContext';
import { MascotIcon } from '../ui/MascotIcon';
import { useToast } from '../../context/ToastContext';
import { Terminal, Copy, Check, Dices, Quote } from 'lucide-react';

export const MascotBanner: React.FC = () => {
  const { activeVibe, setVibe, activeTipIndex, nextTip } = useVibe();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const currentTip = activeVibe.tips[activeTipIndex] || activeVibe.tips[0];

  const handleSelectVibe = (id: VibeId) => {
    setVibe(id);
    const v = VIBES[id];
    showToast(`Selected Persona: ${v.name} (${v.role})`, 'success');
  };

  const handleCopyTip = () => {
    navigator.clipboard.writeText(currentTip);
    setCopied(true);
    showToast('Copied FOSS tip to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section" style={{ paddingTop: 'var(--space-xl)' }}>
      <div className="container">
        <div className="mascot-banner" style={{
          background: 'var(--surface-raised)',
          border: `1px solid ${activeVibe.color}33`,
          boxShadow: `0 8px 32px ${activeVibe.glow}`,
          transition: 'all 0.35s ease'
        }}>
          {/* Top Row: Mascot Info & Interactive Selectors */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-md)'
            }}>
              <div>
                <div className="section-tag" style={{ color: activeVibe.color }}>
                  // COMMUNITY SPIRIT & PERSONAS
                </div>
                <h3 style={{ fontSize: '1.45rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Choose Your Builder Vibe</span>
                  <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: activeVibe.color, fontWeight: 700 }}>
                    [{activeVibe.emoticon}]
                  </span>
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '520px' }}>
                  Select your mascot to customize your campus persona, switch UI accent glows, and unlock tailored hacker tips.
                </p>
              </div>

              {/* Mascot Selector Pills */}
              <div className="mascot-faces-row" style={{ display: 'flex', gap: '12px' }}>
                {(Object.keys(VIBES) as VibeId[]).map(id => {
                  const m = VIBES[id];
                  const isActive = activeVibe.id === id;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSelectVibe(id)}
                      className={`mascot-badge ${isActive ? 'active-mascot' : ''}`}
                      title={`${m.name} - ${m.role}`}
                      style={{
                        background: isActive ? `${m.color}22` : 'var(--code-night)',
                        borderColor: isActive ? m.color : 'var(--surface-border)',
                        boxShadow: isActive ? `0 0 18px ${m.glow}` : 'none',
                        cursor: 'pointer',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        minWidth: '72px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <MascotIcon vibe={id} size={36} color={m.color} />
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: isActive ? m.color : 'var(--text-secondary)'
                      }}>
                        {id.charAt(0).toUpperCase() + id.slice(1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Terminal Hacker Tip Card */}
            <div style={{
              background: 'var(--code-night)',
              border: `1px solid ${activeVibe.color}44`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md) var(--space-lg)',
              marginTop: 'var(--space-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                borderBottom: '1px solid var(--surface-border)',
                paddingBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={15} color={activeVibe.color} />
                  <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: activeVibe.color }}>
                    {activeVibe.name.toUpperCase()} // TINKERTIP #{activeTipIndex + 1}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    background: `${activeVibe.color}18`,
                    color: activeVibe.color,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    {activeVibe.role}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={nextTip}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', height: '28px' }}
                    title="Get another tip"
                  >
                    <Dices size={13} />
                    <span>Next Tip</span>
                  </button>
                  <button
                    onClick={handleCopyTip}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', height: '28px' }}
                    title="Copy tip to clipboard"
                  >
                    {copied ? <Check size={13} color="var(--foss-mint)" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Tip Content */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                lineHeight: '1.5',
                padding: '4px 0'
              }}>
                <span style={{ color: activeVibe.color, marginRight: '8px' }}>❯</span>
                {currentTip}
              </div>

              {/* Persona Quote */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.76rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                paddingTop: '4px'
              }}>
                <Quote size={12} color={activeVibe.color} />
                <span>{activeVibe.quote}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
