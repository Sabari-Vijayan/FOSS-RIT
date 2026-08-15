import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenJoin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenJoin }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <a href="#" className="brand-logo">
          <div className="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#08B74F" />
              <rect x="7" y="9" width="4" height="4" fill="#0F1710" />
              <rect x="21" y="9" width="4" height="4" fill="#0F1710" />
              <path d="M8 18 Q16 27 24 18" stroke="#0F1710" stroke-width="3.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="brand-logo-text">
            <span className="brand-logo-title">FOSS Club RIT</span>
            <span className="brand-logo-sub">x TinkerHub • Kottayam</span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <ul className="nav-links">
          <li><a href="#about" className="nav-link">About</a></li>
          <li><a href="#events" className="nav-link">Workshops & Events</a></li>
          <li><a href="#projects" className="nav-link">Projects Radar</a></li>
          <li><a href="#manifesto" className="nav-link">Manifesto</a></li>
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button className="btn btn-primary" onClick={onOpenJoin}>
            <Sparkles size={16} />
            Join the Club
          </button>
        </div>
      </div>
    </header>
  );
};
