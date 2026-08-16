import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sun, 
  Moon, 
  LogOut, 
  CheckCircle2, 
  ShieldAlert, 
  User as UserIcon,
  Menu,
  X,
  Compass,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';
import { StudentVerifyModal } from '../modals/StudentVerifyModal';
import { useVibe, VIBES, VibeId } from '../../context/VibeContext';
import { MascotIcon } from '../ui/MascotIcon';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, redirectToGitHub } = useAuth();
  const { activeVibe, setVibe } = useVibe();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname, location.hash]);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const handleLoginClick = () => {
    redirectToGitHub();
  };

  return (
    <>
      <header className="navbar">
        <div className="container nav-container">
          {/* Left: Brand Logo */}
          <Link to="/" className="brand-logo">
            <div className="brand-logo-icon">
              <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="6" fill="#08B74F" />
                <rect x="7" y="9" width="4" height="4" fill="#0F1710" />
                <rect x="21" y="9" width="4" height="4" fill="#0F1710" />
                <path d="M8 18 Q16 27 24 18" stroke="#0F1710" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div className="brand-logo-text">
              <span className="brand-logo-title">FOSS Club RIT</span>
              <span className="brand-logo-sub">x TinkerHub</span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="desktop-nav">
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
                  Events
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/projects" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active-nav-link' : ''}`}
                >
                  Projects
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
          </nav>

          {/* Right: Actions & User Profile */}
          <div className="nav-actions">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn" 
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            
            {/* User Profile / Login */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="user-profile-btn"
                  aria-label="User Profile Menu"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      className="user-nav-avatar"
                    />
                  ) : (
                    <div className="user-nav-avatar-placeholder">
                      <UserIcon size={14} />
                    </div>
                  )}
                  <span className="user-nav-name">
                    @{user.username}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }} title={`Builder Persona: ${activeVibe.name}`}>
                    <MascotIcon vibe={activeVibe.id} size={15} color={activeVibe.color} />
                  </span>
                  {user.is_verified_student && (
                    <span title="Verified RIT Student" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <CheckCircle2 size={13} color="var(--foss-mint)" />
                    </span>
                  )}
                </button>

                {dropdownOpen && (
                  <div
                    className="user-dropdown-menu"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-border)' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {user.display_name || user.username}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {user.email || `@${user.username}`}
                      </div>
                    </div>

                    {/* Quick Vibe Persona Switcher */}
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-border)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                        BUILDER PERSONA
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                        {(Object.keys(VIBES) as VibeId[]).map(id => {
                          const v = VIBES[id];
                          const isCur = activeVibe.id === id;
                          return (
                            <button
                              key={id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setVibe(id);
                              }}
                              title={`${v.name} (${v.role})`}
                              style={{
                                background: isCur ? `${v.color}22` : 'var(--surface-raised)',
                                borderColor: isCur ? v.color : 'transparent',
                                border: '1px solid',
                                borderRadius: 'var(--radius-sm)',
                                padding: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <MascotIcon vibe={id} size={20} color={v.color} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsVerifyOpen(true)}
                      className="dropdown-item"
                    >
                      {user.is_verified_student ? (
                        <>
                          <CheckCircle2 size={14} color="var(--foss-mint)" />
                          <span>RIT Verified Student</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={14} color="var(--byte-yellow)" />
                          <span>Verify College Email</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={logout}
                      className="dropdown-item dropdown-item-danger"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="btn btn-secondary btn-sm nav-signin-btn" 
                onClick={handleLoginClick}
              >
                <GitHubIcon size={14} />
                <span className="signin-text">Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-nav-links">
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => `mobile-nav-link ${isActive && !location.hash ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Compass size={16} /> Overview
              </NavLink>
              <NavLink 
                to="/events" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar size={16} /> Workshops & Events
              </NavLink>
              <NavLink 
                to="/projects" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Layers size={16} /> Projects Radar
              </NavLink>
              <a 
                href="/#about" 
                className="mobile-nav-link"
                onClick={(e) => handleSectionClick(e, 'about')}
              >
                <FileText size={16} /> About Club
              </a>
              <a 
                href="/#manifesto" 
                className="mobile-nav-link"
                onClick={(e) => handleSectionClick(e, 'manifesto')}
              >
                <ShieldAlert size={16} /> Manifesto
              </a>
            </div>
          </div>
        )}
      </header>

      {/* College Email Verification Modal */}
      <StudentVerifyModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
      />
    </>
  );
};
