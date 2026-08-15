import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Project } from '../../types';
import { Star, GitFork, AlertCircle, Plus, ExternalLink, ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { GithubIcon } from '../ui/Icons';

interface ProjectsGridProps {
  onOpenSubmitProject: () => void;
  limit?: number;
  showViewAll?: boolean;
  showSearch?: boolean;
  showSorting?: boolean;
  title?: string;
  tagline?: string;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  onOpenSubmitProject,
  limit,
  showViewAll = false,
  showSearch = false,
  showSorting = false,
  title = "Projects Built at RIT Kottayam",
  tagline = "// OPEN SOURCE REPOSITORIES"
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTech, setActiveTech] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'issues' | 'recent'>('stars');

  const techFilters = ['all', 'React', 'TypeScript', 'FastAPI', 'Python', 'Go', 'Tailwind'];

  const loadProjects = async (tech?: string) => {
    try {
      const data = await api.getProjects(tech);
      setProjects(data);
    } catch {
      // Handled by api client fallback
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

          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
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
          <div className="projects-grid">
            {displayedProjects.map(proj => (
              <div key={proj.id} className="project-card interactive-hover-card">
                <div>
                  <div className="project-header">
                    <div className="project-title">
                      <GithubIcon size={18} color="var(--foss-mint)" />
                      <span>{proj.name}</span>
                    </div>
                    <span className="tag-badge" style={{ color: 'var(--foss-mint)', borderColor: 'rgba(8, 183, 79, 0.3)' }}>
                      Open Source
                    </span>
                  </div>

                  <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-md)' }}>
                    {proj.description}
                  </p>

                  <div className="tags-row">
                    {proj.tech_stack.map(tech => (
                      <span key={tech} className="tag-badge">{tech}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 'var(--space-md)',
                    borderTop: '1px solid var(--surface-border)',
                    marginBottom: 'var(--space-md)'
                  }}>
                    <div className="project-stats">
                      <div className="project-stat" title="GitHub Stars">
                        <Star size={13} color="var(--byte-yellow)" />
                        <span>{proj.stars}</span>
                      </div>
                      <div className="project-stat" title="Forks">
                        <GitFork size={13} color="var(--pixel-blue)" />
                        <span>{proj.forks}</span>
                      </div>
                      <div className="project-stat" title="Open Issues">
                        <AlertCircle size={13} color="var(--flame-red)" />
                        <span>{proj.open_issues} issues</span>
                      </div>
                    </div>
                  </div>

                  <a 
                    href={proj.repo_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <GithubIcon size={14} />
                    View on GitHub <ExternalLink size={12} />
                  </a>
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
