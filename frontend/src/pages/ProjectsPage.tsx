import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectsGrid } from '../components/sections/ProjectsGrid';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface ProjectsPageProps {
  onOpenSubmitProject: () => void;
  refreshKey: number;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onOpenSubmitProject, refreshKey }) => {
  return (
    <div style={{ paddingTop: 'var(--space-2xl)', minHeight: '80vh' }}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
            <ArrowLeft size={16} /> Back to Overview
          </Link>
        </div>

        {/* Page Banner */}
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
            <span className="event-badge">Project Radar</span>
            <h1 style={{ marginTop: '8px', fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
              Open Source Showcase
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Discover open-source libraries, web tools, and campus utilities maintained by students and alumni of <strong>RIT Kottayam</strong>. All metrics are auto-synced from GitHub.
            </p>
          </div>

          <button className="btn btn-primary" onClick={onOpenSubmitProject}>
            <Sparkles size={16} />
            Submit Your Project
          </button>
        </div>

        {/* Full Projects Catalog with Search, Sorting & Tech Stack Filter */}
        <ProjectsGrid
          key={`all-projects-${refreshKey}`}
          showSearch={true}
          showSorting={true}
          showViewAll={false}
          title="All Featured Repositories"
          tagline="// CAMPUS OPEN SOURCE RADAR"
          onOpenSubmitProject={onOpenSubmitProject}
        />
      </div>
    </div>
  );
};
