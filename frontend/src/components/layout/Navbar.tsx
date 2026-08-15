import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenJoin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenJoin }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-logo-icon">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#08B74F" />
              <rect x="7" y="9" width="4" height="4" fill="#0F1710" />
              <rect x="21" y="9" width="4" height="4" fill="#0F1710" />
              <path d="M8 18 Q16 27 24 18" stroke="#0F1710" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="brand-logo-text">
            <span className="brand-logo-title">FOSS Club RIT</span>
            <span className="brand-logo-sub">x TinkerHub • Kottayam</span>
          </div>
        </Link>

        {/* Desktop Nav Links - Fixed & Stable Across All Pages */}
        <ul className="nav-links">
          <li>
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => `nav-link ${isActive && !location.hash ? 'active-nav-link' : ''}`}
            >
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/events" 
              className={({ isActive }) => `nav-link ${isActive ? 'active-nav-link' : ''}`}
            >
              Workshops & Events
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/projects" 
              className={({ isActive }) => `nav-link ${isActive ? 'active-nav-link' : ''}`}
            >
              Projects Radar
            </NavLink>
          </li>
          <li>
            <a 
              href="/#about" 
              className="nav-link"
              onClick={(e) => handleSectionClick(e, 'about')}
            >
              About
            </a>
          </li>
          <li>
            <a 
              href="/#manifesto" 
              className="nav-link"
              onClick={(e) => handleSectionClick(e, 'manifesto')}
            >
              Manifesto
            </a>
          </li>
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
