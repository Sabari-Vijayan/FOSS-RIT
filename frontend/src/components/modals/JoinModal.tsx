import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MemberCreate } from '../../types';
import { X, Sparkles } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<MemberCreate>({
    name: '',
    email: '',
    department: 'Computer Science & Engg',
    year_of_study: 2,
    github_username: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.joinClub(formData);
      showToast(`🎉 Welcome to FOSS Club RIT, ${formData.name}!`, 'success');
      onClose();
      setFormData({
        name: '',
        email: '',
        department: 'Computer Science & Engg',
        year_of_study: 2,
        github_username: ''
      });
    } catch (err: any) {
      showToast(err.message || 'Failed to register membership', 'error');
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
          <span className="event-badge">Founding Membership</span>
          <h2 style={{ marginTop: '8px', fontSize: '1.6rem' }}>Join FOSS Club RIT</h2>
          <p style={{ fontSize: '0.9rem' }}>
            Genesis chapter launch with TinkerHub. Open to all students at RIT Kottayam.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="join-name">Full Name *</label>
            <input
              id="join-name"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="join-email">Email (College or Personal) *</label>
            <input
              id="join-email"
              type="email"
              className="form-input"
              required
              placeholder="alex@rit.ac.in"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="join-dept">Department</label>
              <select
                id="join-dept"
                className="form-select"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="Computer Science & Engg">Computer Science & Engg (CSE)</option>
                <option value="Electronics & Comm Engg">Electronics & Comm (ECE)</option>
                <option value="Electrical & Electronics">Electrical & Electronics (EEE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                <option value="Civil Engineering">Civil Engineering (CE)</option>
                <option value="MCA">Master of Computer Applications (MCA)</option>
                <option value="Robotics & AI">Robotics & AI / Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="join-year">Year of Study</label>
              <select
                id="join-year"
                className="form-select"
                value={formData.year_of_study}
                onChange={e => setFormData({ ...formData, year_of_study: Number(e.target.value) })}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year / MCA</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="join-github">GitHub Username (Optional)</label>
            <input
              id="join-github"
              type="text"
              className="form-input"
              placeholder="e.g. alex-rit"
              value={formData.github_username || ''}
              onChange={e => setFormData({ ...formData, github_username: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-sm)' }}
            disabled={submitting}
          >
            <Sparkles size={16} />
            {submitting ? 'Registering...' : 'Join Founding Cohort'}
          </button>
        </form>
      </div>
    </div>
  );
};
