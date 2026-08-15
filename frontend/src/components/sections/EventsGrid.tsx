import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Event } from '../../types';
import { Calendar, MapPin, RefreshCw, Ticket } from 'lucide-react';

interface EventsGridProps {
  onOpenRsvp: (event: Event) => void;
}

export const EventsGrid: React.FC<EventsGridProps> = ({ onOpenRsvp }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <section id="events" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-tag">// UPCOMING SESSIONS</div>
            <h2>Bootcamps & Hackathons</h2>
          </div>

          <button 
            className="btn btn-ghost btn-sm" 
            onClick={loadEvents}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="events-grid">
          {events.map(event => {
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
      </div>
    </section>
  );
};
