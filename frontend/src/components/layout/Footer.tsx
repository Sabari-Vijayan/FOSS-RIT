import React from 'react';
import { ExternalLink, Terminal } from 'lucide-react';
import { GithubIcon } from '../ui/Icons';

interface FooterProps {
  onOpenJoin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenJoin }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{
                width: '44px',
                height: '44px',
                background: 'var(--foss-mint)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <svg width="28" height="28" viewBox="0 0 32 32">
                  <rect x="7" y="9" width="4" height="4" fill="#0F1710" />
                  <rect x="21" y="9" width="4" height="4" fill="#0F1710" />
                  <path d="M8 18 Q16 27 24 18" stroke="#0F1710" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>FOSS Club RIT</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rajiv Gandhi Institute of Technology, Kottayam</span>
            </div>
            <p style={{ fontSize: '0.88rem' }}>
              Building the open source & hacker culture at RIT Kottayam in active collaboration with TinkerHub Foundation.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 'var(--space-md)' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <li><a href="#about" className="nav-link">Why Join</a></li>
              <li><a href="#events" className="nav-link">Bootcamps & Sprints</a></li>
              <li><a href="#projects" className="nav-link">Projects Radar</a></li>
              <li><a href="#manifesto" className="nav-link">Software Freedoms</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 'var(--space-md)' }}>Community</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <li>
                <a href="https://github.com/foss-rit" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <GithubIcon size={14} /> FOSS RIT GitHub
                </a>
              </li>
              <li>
                <a href="https://tinkerhub.org" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ExternalLink size={14} /> TinkerHub Community ↗
                </a>
              </li>
              <li>
                <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Terminal size={14} /> FastAPI Swagger Docs <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', marginBottom: 'var(--space-md)' }}>Ready to Build?</h4>
            <p style={{ fontSize: '0.88rem', marginBottom: 'var(--space-md)' }}>
              Brand new chapter. Zero experience needed. Open to B.Tech (all branches), M.Tech, and MCA students at RIT!
            </p>
            <button className="btn btn-primary btn-sm" onClick={onOpenJoin}>
              Join Founding Cohort
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 FOSS Club RIT Kottayam x TinkerHub. Released under MIT / CC BY-SA.</span>
          <span>Crafted with React, Vite & FOSS Mint.</span>
        </div>
      </div>
    </footer>
  );
};
