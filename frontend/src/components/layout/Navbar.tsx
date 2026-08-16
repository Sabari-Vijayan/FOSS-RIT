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
  const [vibeMenuOpen, setVibeMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    setVibeMenuOpen(false);
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
                <rect width="32" height="32" rx="6" fill="var(--foss-mint)" />
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
            {/* Builder Vibe Persona Switcher Pill */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setVibeMenuOpen(!vibeMenuOpen)}
                className="theme-toggle-btn"
                style={{
                  width: 'auto',
                  padding: '0 10px',
                  gap: '6px',
                  borderColor: `${activeVibe.color}66`,
                  boxShadow: `0 0 12px ${activeVibe.glow}`,
                  transition: 'all 0.25s ease'
                }}
                title={`Builder Vibe: ${activeVibe.name} (Click to switch theme)`}
                aria-label="Switch builder vibe theme"
              >
                <MascotIcon vibe={activeVibe.id} size={18} color={activeVibe.color} />
                <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: activeVibe.color, fontWeight: 700 }}>
                  {activeVibe.emoticon}
                </span>
              </button>

              {vibeMenuOpen && (
                <div
                  className="user-dropdown-menu"
                  style={{ minWidth: '240px', right: 0 }}
                  onClick={() => setVibeMenuOpen(false)}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--surface-border)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      // CHOOSE BUILDER VIBE
                    </div>
                  </div>
                  <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(Object.keys(VIBES) as VibeId[]).map(id => {
                      const v = VIBES[id];
                      const isCur = activeVibe.id === id;
                      return (
                        <button
                          key={id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setVibe(id);
                            setVibeMenuOpen(false);
                          }}
                          className="dropdown-item"
                          style={{
                            background: isCur ? `${v.color}22` : 'transparent',
                            border: `1px solid ${isCur ? v.color : 'transparent'}`,
                            borderRadius: 'var(--radius-sm)',
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MascotIcon vibe={id} size={20} color={v.color} />
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: isCur ? v.color : 'var(--text-primary)' }}>
                                {v.name}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {v.role}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: v.color, fontWeight: 700 }}>
                            {v.emoticon}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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

              {/* Mobile Builder Persona Selector */}
              <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--surface-border)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px', fontWeight: 600 }}>
                  // BUILDER PERSONA
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {(Object.keys(VIBES) as VibeId[]).map(id => {
                    const v = VIBES[id];
                    const isCur = activeVibe.id === id;
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          setVibe(id);
                          setMobileMenuOpen(false);
                        }}
                        style={{
                          background: isCur ? `${v.color}22` : 'var(--surface-raised)',
                          borderColor: isCur ? v.color : 'var(--surface-border)',
                          border: '1px solid',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 4px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <MascotIcon vibe={id} size={22} color={v.color} />
                        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: isCur ? v.color : 'var(--text-secondary)', fontWeight: 600 }}>
                          {id.charAt(0).toUpperCase() + id.slice(1)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
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
