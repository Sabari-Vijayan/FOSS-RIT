import React, { useState } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { X, Sparkles } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!repoUrl.includes('github.com')) {
        throw new Error('Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)');
      }

      await api.submitProject({ repo_url: repoUrl.trim() });
      showToast('🚀 Repository submitted! Scraping live GitHub metadata...', 'success');
      onSuccess();
      onClose();
      setRepoUrl('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit repository', 'error');
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
          <span className="event-badge">Project Radar</span>
          <h2 style={{ marginTop: '8px', fontSize: '1.5rem' }}>Feature a FOSS Project</h2>
          <p style={{ fontSize: '0.9rem' }}>
            Built an open-source tool at RIT Kottayam? Just paste your GitHub link and we'll auto-fetch your stars, tech stack, and description.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="proj-url">GitHub Repository Link *</label>
            <input
              id="proj-url"
              type="url"
              className="form-input"
              required
              placeholder="https://github.com/your-username/your-project"
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
            />
          </div>

          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-md)'
          }}>
            💡 <strong>Auto-Scraped:</strong> Name, description, live stars, forks, issues, and tech stack tags will be automatically synchronized from GitHub.
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--space-xs)' }}
            disabled={submitting}
          >
            <Sparkles size={16} />
            {submitting ? 'Scraping & Adding...' : 'Submit Repository'}
          </button>
        </form>
      </div>
    </div>
  );
};
