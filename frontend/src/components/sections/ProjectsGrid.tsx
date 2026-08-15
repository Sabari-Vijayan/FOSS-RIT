import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Project } from '../../types';
import { Star, GitFork, AlertCircle, Plus, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../ui/Icons';

interface ProjectsGridProps {
  onOpenSubmitProject: () => void;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ onOpenSubmitProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTech, setActiveTech] = useState<string>('all');

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

  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-tag">// OPEN SOURCE REPOSITORIES</div>
            <h2>Projects Built at RIT Kottayam</h2>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="filter-btn-group">
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

            <button className="btn btn-secondary btn-sm" onClick={onOpenSubmitProject}>
              <Plus size={14} />
              Submit Project Link
            </button>
          </div>
        </div>

        <div className="projects-grid">
          {projects.map(proj => (
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
      </div>
    </section>
  );
};
