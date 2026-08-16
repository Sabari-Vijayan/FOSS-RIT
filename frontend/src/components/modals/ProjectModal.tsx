import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { GitHubIcon } from '../ui/GitHubIcon';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, redirectToGitHub } = useAuth();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');

  if (!isOpen) return null;

  const handleLoginClick = () => {
    redirectToGitHub();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in with GitHub to feature your repository', 'error');
      return;
    }

    setSubmitting(true);

    try {
      if (!repoUrl.includes('github.com')) {
        throw new Error('Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)');
      }

      const res = await api.submitProject({ repo_url: repoUrl.trim() });
      showToast(`🚀 Featured '${res.name}' on FOSS Club Radar!`, 'success');
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
            Built an open-source tool at RIT Kottayam? Paste your GitHub link and we'll auto-fetch your live stars, tech stack, and description.
          </p>
        </div>

        {!user ? (
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-xl)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(253, 152, 0, 0.1)',
              color: 'var(--byte-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-md)'
            }}>
              <ShieldAlert size={24} />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>Authentication Required</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
              To prevent unauthorized submissions and showcase verified campus authors, please sign in with GitHub before featuring your project.
            </p>
            <button className="btn btn-primary" onClick={handleLoginClick} style={{ width: '100%', justifyContent: 'center' }}>
              <GitHubIcon size={16} />
              Sign In with GitHub to Continue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--foss-mint-subtle)',
              border: '1px solid rgba(8, 183, 79, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: 'var(--foss-mint)',
              marginBottom: 'var(--space-md)'
            }}>
              <CheckCircle2 size={15} />
              <span>Submitting as <strong>@{user.username}</strong></span>
              {user.is_verified_student && <span style={{ color: 'var(--text-muted)' }}>(Verified RIT Student)</span>}
            </div>

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
        )}
      </div>
    </div>
  );
};
