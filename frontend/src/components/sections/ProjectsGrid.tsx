import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Project } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Star, GitFork, AlertCircle, Plus, ExternalLink, ArrowRight, Search, SlidersHorizontal, CheckCircle2, RefreshCw } from 'lucide-react';
import { GithubIcon } from '../ui/Icons';

interface ProjectsGridProps {
  onOpenSubmitProject: () => void;
  limit?: number;
  showViewAll?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  showSync?: boolean;
  title?: string;
  tagline?: string;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  onOpenSubmitProject,
  limit,
  showViewAll = false,
  showSearch = false,
  showSorting = false,
  showSync = true,
  title = "Projects Built at RIT Kottayam",
  tagline = "// OPEN SOURCE REPOSITORIES"
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTech, setActiveTech] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'issues' | 'recent'>('stars');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(() => {
    return localStorage.getItem('foss_projects_last_synced') || null;
  });
  const { showToast } = useToast();

  const techFilters = ['all', 'React', 'TypeScript', 'FastAPI', 'Python', 'Go', 'Tailwind'];

  const loadProjects = async (tech?: string, forceSync?: boolean) => {
    try {
      const data = await api.getProjects(tech, forceSync);
      setProjects(data);
    } catch {
      // Handled by api client fallback
    }
  };

  const handleSyncProjects = async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncProjects();
      if (res.projects) {
        setProjects(
          activeTech && activeTech !== 'all'
            ? res.projects.filter(p => p.tech_stack.some(t => t.toLowerCase() === activeTech.toLowerCase()))
            : res.projects
        );
      }
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSynced(nowTime);
      localStorage.setItem('foss_projects_last_synced', nowTime);
      showToast(res.message || 'GitHub stats synchronized successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to sync with GitHub API', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadProjects(activeTech);
  }, [activeTech]);

  // Filter by search query
  let filteredProjects = projects.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tech_stack.some(t => t.toLowerCase().includes(q))
    );
  });

  // Sort
  if (sortBy === 'stars') {
    filteredProjects.sort((a, b) => b.stars - a.stars);
  } else if (sortBy === 'forks') {
    filteredProjects.sort((a, b) => b.forks - a.forks);
  } else if (sortBy === 'issues') {
    filteredProjects.sort((a, b) => b.open_issues - a.open_issues);
  }

  const displayedProjects = limit ? filteredProjects.slice(0, limit) : filteredProjects;

  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-tag">{tagline}</div>
            <h2>{title}</h2>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
            {showSearch && (
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search projects or tech..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            )}

            {showSorting && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} color="var(--text-muted)" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="form-select"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}
                >
                  <option value="stars">Most Stars</option>
                  <option value="forks">Most Forks</option>
                  <option value="issues">Most Open Issues</option>
                  <option value="recent">Recently Added</option>
                </select>
              </div>
            )}

            {showSync && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSyncProjects}
                disabled={isSyncing}
                title={lastSynced ? `Last synchronized with GitHub at ${lastSynced}` : "Sync live stars & forks from GitHub"}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={13} className={isSyncing ? 'spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync GitHub'}</span>
              </button>
            )}

            {showViewAll && (
              <Link to="/projects" className="btn btn-ghost btn-sm">
                View all <ArrowRight size={14} />
              </Link>
            )}

            <button className="btn btn-secondary btn-sm" onClick={onOpenSubmitProject}>
              <Plus size={14} />
              Submit Project Link
            </button>
          </div>
        </div>

        {/* Tech Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-xl)' }}>
          {techFilters.map(tech => (
            <button
              key={tech}
              className={`filter-btn ${activeTech === tech ? 'active' : ''}`}
              onClick={() => setActiveTech(tech)}
            >
              {tech === 'all' ? 'All Tech' : tech}
            </button>
          ))}
        </div>

        {displayedProjects.length === 0 ? (
          <div style={{
            background: 'var(--open-gray)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-2xl)',
            textAlign: 'center'
          }}>
            <p>No repositories found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="projects-list">
            {displayedProjects.map(proj => (
              <div key={proj.id} className="project-row-card interactive-hover-card">
                <div className="project-row-main">
                  {/* Top Line: Name, Badges, Stats & Repo Button */}
                  <div className="project-row-header">
                    <div className="project-row-title-group">
                      <GithubIcon size={17} color="var(--foss-mint)" style={{ flexShrink: 0 }} />
                      <a 
                        href={proj.repo_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="project-row-title"
                      >
                        {proj.name}
                      </a>
                      <span className="tag-badge-pill">Open Source</span>
                      {proj.is_verified_student && (
                        <span 
                          className="verified-student-badge"
                          title="Verified Student at Rajiv Gandhi Institute of Technology (RIT Kottayam)"
                        >
                          <CheckCircle2 size={11} /> RIT Verified
                        </span>
                      )}
                    </div>

                    <div className="project-row-actions">
                      <div className="project-stats-inline">
                        <span className="project-stat" title="GitHub Stars">
                          <Star size={13} color="var(--byte-yellow)" />
                          <strong>{proj.stars.toLocaleString()}</strong>
                        </span>
                        <span className="project-stat" title="Forks">
                          <GitFork size={13} color="var(--pixel-blue)" />
                          <span>{proj.forks.toLocaleString()}</span>
                        </span>
                        <span className="project-stat" title="Open Issues">
                          <AlertCircle size={13} color="var(--flame-red)" />
                          <span>{proj.open_issues}</span>
                        </span>
                      </div>

                      <a 
                        href={proj.repo_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary btn-sm project-view-btn"
                        title="View on GitHub"
                      >
                        <span>Repo</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Middle Line: Concise Description */}
                  <p className="project-row-desc">
                    {proj.description}
                  </p>

                  {/* Bottom Line: Tags & Author */}
                  <div className="project-row-footer">
                    <div className="tags-row-inline">
                      {proj.tech_stack.slice(0, 6).map(tech => (
                        <span key={tech} className="tag-badge">{tech}</span>
                      ))}
                    </div>

                    {proj.submitted_by_username && (
                      <a
                        href={`https://github.com/${proj.submitted_by_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-author-link"
                        title={`View @${proj.submitted_by_username} on GitHub`}
                      >
                        <img
                          src={`https://github.com/${proj.submitted_by_username}.png?size=48`}
                          alt={`@${proj.submitted_by_username}`}
                          className="project-author-pfp"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span>by @{proj.submitted_by_username}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showViewAll && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-2xl)' }}>
            <Link to="/projects" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
              Explore Complete Projects Radar <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
