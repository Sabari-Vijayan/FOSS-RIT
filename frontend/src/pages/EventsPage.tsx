import React from 'react';
import { Link } from 'react-router-dom';
import { EventsGrid } from '../components/sections/EventsGrid';
import { Event } from '../types';
import { ArrowLeft } from 'lucide-react';

interface EventsPageProps {
  onOpenRsvp: (event: Event) => void;
  refreshKey: number;
}

export const EventsPage: React.FC<EventsPageProps> = ({ onOpenRsvp, refreshKey }) => {
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
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '680px' }}>
            <span className="event-badge">Campus Schedule</span>
            <h1 style={{ marginTop: '8px', fontSize: 'clamp(2rem, 4vw, 2.8rem)' }}>
              Workshops, Hackathons & Bootcamps
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
              Explore hands-on technical sessions organized by <strong>FOSS Club RIT Kottayam</strong> in collaboration with <strong>TinkerHub</strong>. All sessions are 100% free and beginner-friendly.
            </p>
          </div>
        </div>

        {/* Full Events Catalog with Live Search */}
        <EventsGrid
          key={`all-events-${refreshKey}`}
          showSearch={true}
          showViewAll={false}
          title="All Scheduled Sessions"
          tagline="// COMPLETE WORKSHOP ROSTER"
          onOpenRsvp={onOpenRsvp}
        />
      </div>
    </div>
  );
};
