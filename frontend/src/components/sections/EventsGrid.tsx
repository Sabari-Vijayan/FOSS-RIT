import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Event } from '../../types';
import { Calendar, MapPin, RefreshCw, Ticket, ArrowRight, Search, Zap, ExternalLink } from 'lucide-react';

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
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'workshop' | 'talk' | 'hackathon'>('all');

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

  const handleSyncTinkerHub = async () => {
    setSyncing(true);
    setSyncStatus('Syncing live campus schedule with TinkerHub RIT...');
    try {
      const res = await api.syncTinkerHub();
      if (res.events && res.events.length > 0) {
        setEvents(res.events);
      } else {
        await loadEvents();
      }
      setSyncStatus(`Updated! Synced ${res.synced_total || 0} sessions live from TinkerHub RIT.`);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err: any) {
      setSyncStatus(err.message || 'Sync failed');
      setTimeout(() => setSyncStatus(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const typeLower = (e.event_type || '').toLowerCase();
    
    // Category format filter
    if (filterCategory === 'workshop' && !typeLower.includes('workshop') && !typeLower.includes('bootcamp') && !typeLower.includes('learning')) {
      return false;
    }
    if (filterCategory === 'talk' && !typeLower.includes('talk') && !typeLower.includes('meetup') && !typeLower.includes('meeting')) {
      return false;
    }
    if (filterCategory === 'hackathon' && !typeLower.includes('hackathon') && !typeLower.includes('challenge')) {
      return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      typeLower.includes(q)
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

          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
            {showSearch && (
              <div style={{ position: 'relative', minWidth: '220px' }}>
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

            {/* Sync TinkerHub Button */}
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleSyncTinkerHub}
              disabled={syncing || loading}
              title="Scrape and sync latest events live from TinkerHub RIT campus radar"
              style={{ borderColor: 'rgba(253, 152, 0, 0.4)', color: '#ff9d00' }}
            >
              <Zap size={14} className={syncing ? 'spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync TinkerHub'}
            </button>

            {/* Refresh Button */}
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={loadEvents}
              disabled={loading || syncing}
              title="Refresh schedule"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              Refresh
            </button>

            {showViewAll && (
              <Link to="/events" className="btn btn-ghost btn-sm">
                View all <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div style={{
            background: 'rgba(253, 152, 0, 0.1)',
            border: '1px solid rgba(253, 152, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            fontSize: '0.85rem',
            color: '#ffaa2b',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Zap size={15} />
            <span>{syncStatus}</span>
          </div>
        )}

        {/* Category Filters by Session Format */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '4px' }}>Filter:</span>
          <button
            className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCategory('all')}
            style={{ fontSize: '0.8rem' }}
          >
            All Sessions ({events.length})
          </button>
          <button
            className={`btn btn-sm ${filterCategory === 'workshop' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCategory('workshop')}
            style={{ fontSize: '0.8rem' }}
          >
            Workshops & Bootcamps
          </button>
          <button
            className={`btn btn-sm ${filterCategory === 'talk' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCategory('talk')}
            style={{ fontSize: '0.8rem' }}
          >
            Talks & Meetups
          </button>
          <button
            className={`btn btn-sm ${filterCategory === 'hackathon' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilterCategory('hackathon')}
            style={{ fontSize: '0.8rem' }}
          >
            Hackathons
          </button>
        </div>

        {displayedEvents.length === 0 ? (
          <div style={{
            background: 'var(--open-gray)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-2xl)',
            textAlign: 'center'
          }}>
            <p>No sessions found matching current criteria.</p>
          </div>
        ) : (
          <div className="events-grid">
            {displayedEvents.map(event => {
              const isFull = event.capacity > 0 && event.registered_count >= event.capacity;
              const tinkerHubLink = event.event_url || "https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor";

              return (
                <div key={event.id} className="event-card interactive-hover-card">
                  <div className="event-top">
                    {/* Banner Image if available */}
                    {event.banner_url && (
                      <img 
                        src={event.banner_url} 
                        alt={event.title}
                        className="event-card-banner"
                        loading="lazy"
                      />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '6px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {event.is_collab !== false ? (
                          <span className="event-badge-collab" title="In collaboration with TinkerHub RIT">
                            <Zap size={11} /> TinkerHub Collab
                          </span>
                        ) : (
                          <span className="event-badge">FOSS Exclusive</span>
                        )}

                        {event.event_type && (
                          <span className="event-badge-type">
                            {event.event_type}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {event.capacity > 0 ? `${event.capacity} Capacity` : 'Open Entry'}
                      </span>
                    </div>

                    <h3 className="event-title">{event.title}</h3>
                    <p className="event-tagline" style={{ marginTop: '6px', marginBottom: '16px' }}>
                      {event.description}
                    </p>

                    <div className="event-meta-list">
                      <div className="event-meta-item">
                        <Calendar size={15} color="var(--foss-mint)" />
                        <span>{event.date_time || event.date || 'Upcoming Session'}</span>
                      </div>
                      <div className="event-meta-item">
                        <MapPin size={15} color="var(--pixel-blue)" />
                        <span>{event.location || event.venue || 'RIT Kottayam (Velloor)'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {event.is_collab !== false ? (
                      <a 
                        href={tinkerHubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Zap size={15} />
                        Register on TinkerHub <ExternalLink size={13} />
                      </a>
                    ) : (
                      <button 
                        className={`btn ${isFull ? 'btn-secondary' : 'btn-primary'}`} 
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => !isFull && onOpenRsvp(event)}
                        disabled={isFull}
                      >
                        <Ticket size={16} />
                        {isFull ? 'Event Full' : 'Reserve Spot / RSVP'}
                      </button>
                    )}
                  </div>
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
