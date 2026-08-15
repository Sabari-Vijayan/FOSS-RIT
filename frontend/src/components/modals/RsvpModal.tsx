import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Event, EventRSVP } from '../../types';
import { X, Ticket } from 'lucide-react';

interface RsvpModalProps {
  event: Event | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ event, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventRSVP>({
    name: '',
    email: ''
  });

  if (!event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.rsvpEvent(event.id, formData);
      showToast(res.message || `Spot confirmed for ${event.title}!`, 'success');
      onSuccess();
      onClose();
      setFormData({ name: '', email: '' });
    } catch (err: any) {
      showToast(err.message || 'Failed to RSVP for event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={16} />
        </button>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <span className="event-badge">Workshop RSVP</span>
          <h2 style={{ marginTop: '8px', fontSize: '1.5rem' }}>{event.title}</h2>
          <p style={{ fontSize: '0.9rem' }}>
            Reserve your seat at {event.location}.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="rsvp-name">Your Full Name *</label>
            <input
              id="rsvp-name"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rsvp-email">Email Address *</label>
            <input
              id="rsvp-email"
              type="email"
              className="form-input"
              required
              placeholder="alex@rit.ac.in"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-sm)' }}
            disabled={submitting}
          >
            <Ticket size={16} />
            {submitting ? 'Confirming Spot...' : 'Confirm RSVP Spot'}
          </button>
        </form>
      </div>
    </div>
  );
};
