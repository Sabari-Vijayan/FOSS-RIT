import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ContributorRank } from '../types';
import { useToast } from '../context/ToastContext';
import { 
  Star, 
  GitFork, 
  Layers, 
  CheckCircle2, 
  Search, 
  SlidersHorizontal,
  RefreshCw, 
  HelpCircle,
  ExternalLink,
  ArrowLeft,
  Zap,
  Sparkles
} from 'lucide-react';

interface LeaderboardPageProps {
  onOpenSubmitProject?: () => void;
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onOpenSubmitProject }) => {
  const { showToast } = useToast();
  const [timeframe, setTimeframe] = useState<'all_time' | 'monthly'>('all_time');
  const [contributors, setContributors] = useState<ContributorRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTier, setActiveTier] = useState<string>('all');
  const [showXpGuide, setShowXpGuide] = useState(false);

  const tierFilters = [
    { id: 'all', label: 'All Contributors' },
    { id: '5', label: 'Level 5 (Kernel Overlord)' },
    { id: '4', label: 'Level 4 (Systems Architect)' },
    { id: '3', label: 'Level 3 (Byte Craftsman)' },
    { id: '2', label: 'Level 2 (Novice)' },
    { id: 'verified', label: 'RIT Verified' }
  ];

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard(timeframe);
      setContributors(data.contributors || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load leaderboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  // Filter contributors
  const filteredContributors = contributors.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.username.toLowerCase().includes(q) || 
                        c.display_name.toLowerCase().includes(q) || 
                        c.title.toLowerCase().includes(q);
      if (!matchName) return false;
    }

    if (activeTier === 'verified') return c.is_verified_student;
    if (activeTier !== 'all') return c.level === parseInt(activeTier, 10);

    return true;
  });

  const getTierColor = (level: number) => {
    switch (level) {
      case 5: return '#E84A36'; // Kernel Overlord
      case 4: return '#A855F7'; // Systems Architect
      case 3: return '#2B7FFF'; // Byte Craftsman
      case 2: return 'var(--foss-mint)'; // Open Source Novice
      default: return 'var(--text-muted)'; // Script Tinkerer
    }
  };

  return (
    <div style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)', minHeight: '85vh' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
            <ArrowLeft size={16} /> Back to Overview
          </Link>
        </div>

        {/* Page Banner / Hero Card */}
        <div style={{
          background: 'var(--open-gray)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)',
          marginBottom: 'var(--space-2xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-lg)'
        }}>
          <div style={{ maxWidth: '640px' }}>
            <span className="event-badge">Campus Radar</span>
            <h1 style={{ marginTop: '8px', fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
              Contributor Hall of Fame
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Level up your open-source journey. Earn XP by shipping tools, getting peer forks, and earning stars across campus repositories.
            </p>
          </div>

          {onOpenSubmitProject && (
            <button className="btn btn-primary" onClick={onOpenSubmitProject}>
              <Sparkles size={16} />
              Feature Your Project
            </button>
          )}
        </div>

        {/* Section Header & Controls */}
        <section className="section" style={{ padding: 0 }}>
          <div className="section-header">
            <div>
              <div className="section-tag">// CAMPUS DEVELOPER RADAR</div>
              <h2>All Contributors & Rankings</h2>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search contributor or title..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              {/* Timeframe Sort/Mode Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} color="var(--text-muted)" />
                <select
                  value={timeframe}
                  onChange={e => setTimeframe(e.target.value as any)}
                  className="form-select"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                >
                  <option value="all_time">All-Time Hall of Fame</option>
                  <option value="monthly">This Month's Sprint</option>
                </select>
              </div>

              {/* How XP Works button */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowXpGuide(!showXpGuide)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <HelpCircle size={14} />
                <span>How XP Works</span>
              </button>

              {/* Refresh Leaderboard */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={fetchLeaderboard}
                disabled={loading}
                title="Refresh Leaderboard"
                aria-label="Refresh Leaderboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} className={loading ? 'spin' : ''} />
                <span>{loading ? 'Updating...' : 'Sync Radar'}</span>
              </button>
            </div>
          </div>

          {/* XP Guide Banner */}
          {showXpGuide && (
            <div style={{
              background: 'var(--open-gray)',
              border: '1px solid var(--foss-mint-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: 'var(--space-xl)',
              animation: 'fadeIn 0.2s ease'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--foss-mint)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={15} /> Balanced Campus XP Formula (Boot.dev Style)
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                XP is engineered so newcomers and active builders level up quickly:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                <div style={{ background: 'var(--surface-raised)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
                  <strong style={{ color: 'var(--foss-mint)' }}>+50 XP:</strong> Verify @rit.ac.in Email
                </div>
                <div style={{ background: 'var(--surface-raised)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
                  <strong style={{ color: '#2B7FFF' }}>+100 XP:</strong> Feature 1st Project
                </div>
                <div style={{ background: 'var(--surface-raised)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
                  <strong style={{ color: '#F5C040' }}>+75 XP:</strong> Feature 2nd & 3rd Project
                </div>
                <div style={{ background: 'var(--surface-raised)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
                  <strong style={{ color: '#A855F7' }}>+20 XP / fork:</strong> Peer Cloned Your Repo
                </div>
                <div style={{ background: 'var(--surface-raised)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
                  <strong style={{ color: '#EAB308' }}>+5 XP / star:</strong> GitHub Star (max 100/repo)
                </div>
                <div style={{ background: 'var(--surface-raised)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
                  <strong style={{ color: '#EC4899' }}>+15 XP / tech:</strong> Multi-Stack Versatility
                </div>
              </div>
            </div>
          )}

          {/* Tier Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-xl)' }}>
            {tierFilters.map(t => (
              <button
                key={t.id}
                className={`filter-btn ${activeTier === t.id ? 'active' : ''}`}
                onClick={() => setActiveTier(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Contributor Rows / Empty State */}
          {loading ? (
            <div style={{
              background: 'var(--open-gray)',
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-2xl)',
              textAlign: 'center'
            }}>
              <RefreshCw size={22} className="spin" style={{ margin: '0 auto 10px', color: 'var(--foss-mint)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Calculating live contributor ranks and XP scores...
              </p>
            </div>
          ) : filteredContributors.length === 0 ? (
            <div style={{
              background: 'var(--open-gray)',
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-2xl)',
              textAlign: 'center'
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                No contributors found matching your filter criteria.
              </p>
            </div>
          ) : (
            <div className="projects-list">
              {filteredContributors.map((c) => (
                <div
                  key={c.user_id || c.username}
                  className="project-row-card"
                  style={{
                    borderLeft: c.rank === 1 ? '3px solid #F5C040' : c.rank === 2 ? '3px solid silver' : c.rank === 3 ? '3px solid #CD7F32' : undefined
                  }}
                >
                  <div className="project-row-main">
                    {/* Header Row */}
                    <div className="project-row-header">
                      <div className="project-row-title-group">
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          fontSize: c.rank <= 3 ? '1.15rem' : '0.92rem',
                          minWidth: '28px',
                          textAlign: 'center',
                          color: c.rank === 1 ? '#F5C040' : c.rank === 2 ? 'silver' : c.rank === 3 ? '#CD7F32' : 'var(--text-muted)'
                        }}>
                          {c.medal || `#${c.rank}`}
                        </span>

                        <img
                          src={c.avatar_url}
                          alt={c.username}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: `1.5px solid ${getTierColor(c.level)}`
                          }}
                        />

                        <span className="project-row-title">
                          {c.display_name}
                        </span>

                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          @{c.username}
                        </span>

                        <span 
                          className="tag-badge-pill"
                          style={{
                            borderColor: `${getTierColor(c.level)}66`,
                            color: getTierColor(c.level),
                            background: `${getTierColor(c.level)}15`,
                            fontWeight: 700
                          }}
                        >
                          LVL {c.level} • {c.title}
                        </span>

                        {c.is_verified_student && (
                          <span className="verified-student-badge">
                            <CheckCircle2 size={11} /> RIT Verified
                          </span>
                        )}
                      </div>

                      {/* Right side stats & action */}
                      <div className="project-row-actions">
                        <div className="project-stats-inline">
                          <span className="project-stat" title="Featured Projects">
                            <Layers size={13} color="var(--text-secondary)" />
                            <strong>{c.total_projects}</strong>
                          </span>
                          <span className="project-stat" title="GitHub Stars">
                            <Star size={13} color="var(--byte-yellow)" />
                            <strong>{c.total_stars}</strong>
                          </span>
                          <span className="project-stat" title="Peer Forks">
                            <GitFork size={13} color="var(--pixel-blue)" />
                            <span>{c.total_forks}</span>
                          </span>
                          <span className="project-stat" title="Total XP" style={{ color: getTierColor(c.level), fontWeight: 800 }}>
                            <Zap size={13} color={getTierColor(c.level)} />
                            <strong>{c.xp} XP</strong>
                          </span>
                        </div>

                        <a
                          href={`https://github.com/${c.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm project-view-btn"
                          title="View GitHub Profile"
                        >
                          <span>Profile</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>

                    {/* Middle line: XP Progress Bar toward next tier */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                      <div style={{ flex: 1, maxWidth: '240px', height: '6px', background: 'var(--surface-border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                        <div style={{ width: `${c.progress}%`, height: '100%', background: getTierColor(c.level), borderRadius: 'var(--radius-pill)' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {c.progress}% to next tier ({c.min_xp} → {c.max_xp} XP)
                      </span>
                    </div>

                    {/* Bottom line: Badges */}
                    {c.badges && c.badges.length > 0 && (
                      <div className="project-row-footer" style={{ marginTop: '4px' }}>
                        <div className="tags-row-inline">
                          {c.badges.map(b => (
                            <span key={b.id} className="tag-badge" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span>{b.icon}</span> {b.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
