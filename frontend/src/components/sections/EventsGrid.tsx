import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Event } from '../../types';
import { Calendar, MapPin, RefreshCw, Ticket, ArrowRight, Search } from 'lucide-react';

interface EventsGridProps {
  onOpenRsvp: (event: Event) => void;
  limit?: number;
  showViewAll?: boolean;
  showSearch?: boolean;
  title?: string;
  tagline?: string;
}

export const EventsGrid: React.FC<EventsGridProps> = ({
  onOpenRsvp,
  limit,
  showViewAll = false,
  showSearch = false,
  title = "Bootcamps & Hackathons",
  tagline = "// UPCOMING SESSIONS"
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch {
      // Handled in api client fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );
  });

  const displayedEvents = limit ? filteredEvents.slice(0, limit) : filteredEvents;

  return (
    <section id="events" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-tag">{tagline}</div>
            <h2>{title}</h2>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            {showSearch && (
              <div style={{ position: 'relative', minWidth: '240px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search workshops & sessions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', width: '100%', fontSize: '0.85rem' }}
                />
              </div>
            )}

            {showViewAll && (
              <Link to="/events" className="btn btn-ghost btn-sm">
                View all <ArrowRight size={14} />
              </Link>
            )}

            <button 
              className="btn btn-ghost btn-sm" 
              onClick={loadEvents}
              disabled={loading}
              title="Refresh schedule"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {displayedEvents.length === 0 ? (
          <div style={{
            background: 'var(--open-gray)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-2xl)',
            textAlign: 'center'
          }}>
            <p>No workshops found matching "{searchQuery}".</p>
          </div>
        ) : (
          <div className="events-grid">
            {displayedEvents.map(event => {
              const isFull = event.registered_count >= event.capacity;
              return (
                <div key={event.id} className="event-card interactive-hover-card">
                  <div className="event-top">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="event-badge">Upcoming</span>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {event.registered_count}/{event.capacity} Filled
                      </span>
                    </div>

                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-tagline" style={{ marginTop: '6px', marginBottom: '16px' }}>
                      {event.description}
                    </p>

                    <div className="event-meta-list">
                      <div className="event-meta-item">
                        <Calendar size={15} color="var(--foss-mint)" />
                        <span>{event.date_time}</span>
                      </div>
                      <div className="event-meta-item">
                        <MapPin size={15} color="var(--pixel-blue)" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    className={`btn ${isFull ? 'btn-secondary' : 'btn-primary'}`} 
                    style={{ width: '100%' }}
                    onClick={() => !isFull && onOpenRsvp(event)}
                    disabled={isFull}
                  >
                    <Ticket size={16} />
                    {isFull ? 'Event Full' : 'Reserve Spot / RSVP'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showViewAll && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-2xl)' }}>
            <Link to="/events" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
              View All Workshops & Sessions <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};
