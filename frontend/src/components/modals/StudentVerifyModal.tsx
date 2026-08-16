import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { X, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';

interface StudentVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentVerifyModal: React.FC<StudentVerifyModalProps> = ({ isOpen, onClose }) => {
  const { user, verifyCollegeEmail } = useAuth();
  const { showToast } = useToast();
  const [collegeEmail, setCollegeEmail] = useState(user?.college_email || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = collegeEmail.trim().toLowerCase();
    if (!clean.endsWith('@rit.ac.in') && !clean.endsWith('.rit.ac.in')) {
      showToast('Please enter a valid Rajiv Gandhi Institute of Technology email ending in @rit.ac.in', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await verifyCollegeEmail(clean);
      showToast('Verified! You now have the Verified RIT Student badge.', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={16} />
        </button>

        <div style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'var(--foss-mint-subtle)',
            border: '1px solid var(--foss-mint-glow)',
            color: 'var(--foss-mint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-md)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem' }}>Verify RIT Student Status</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Link your official college email to get verified badges across club projects and discussions.
          </p>
        </div>

        {user.is_verified_student ? (
          <div style={{
            background: 'var(--foss-mint-subtle)',
            border: '1px solid var(--foss-mint)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-md)',
            textAlign: 'center',
            marginBottom: 'var(--space-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--foss-mint)', fontWeight: 700 }}>
              <CheckCircle2 size={18} /> Verified RIT Student
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {user.college_email}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="college-email">Official College Email (@rit.ac.in) *</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="college-email"
                  type="email"
                  className="form-input"
                  required
                  placeholder="yourname@rit.ac.in"
                  value={collegeEmail}
                  onChange={e => setCollegeEmail(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Your personal GitHub account remains your primary login. This just verifies campus affiliation.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'var(--space-md)' }}
              disabled={submitting}
            >
              <Mail size={16} />
              {submitting ? 'Verifying...' : 'Confirm College Email'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
