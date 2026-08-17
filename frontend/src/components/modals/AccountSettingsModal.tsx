import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { X, Shield, Eye, EyeOff, Trash2, AlertTriangle, CheckCircle2, User as UserIcon } from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isHidden, setIsHidden] = useState(user?.is_leaderboard_hidden ?? false);
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    if (user) {
      setIsHidden(Boolean(user.is_leaderboard_hidden));
    }
  }, [user?.is_leaderboard_hidden, isOpen]);

  if (!isOpen || !user) return null;

  const handleTogglePrivacy = async () => {
    const nextVal = !isHidden;
    setIsHidden(nextVal);
    setUpdatingPrivacy(true);
    try {
      const updatedUser = await api.updatePrivacySettings(nextVal);
      updateUser(updatedUser);
      showToast(
        nextVal
          ? 'Incognito Mode enabled. Your profile is now hidden from the public leaderboard.'
          : 'Public mode enabled. Your profile is now visible on the campus leaderboard.',
        'info'
      );
    } catch (err: any) {
      setIsHidden(!nextVal); // revert
      showToast(err.message || 'Failed to update privacy settings', 'error');
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      showToast('Your account and all submitted projects have been permanently deleted.', 'info');
      onClose();
      logout();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account', 'error');
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-lg)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Account & Privacy Settings</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              @{user.username} // Manage identity & data rights
            </span>
          </div>
        </div>

        {/* User Card Summary */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--surface-raised)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--surface-border)' }} />
          ) : (
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserIcon size={18} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
              {user.display_name || user.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user.college_email || user.email || 'No email attached'}
            </div>
          </div>
          {user.is_verified_student && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--foss-mint)', background: 'var(--foss-mint-subtle)', padding: '3px 8px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--foss-mint-glow)' }}>
              <CheckCircle2 size={12} /> RIT Verified
            </span>
          )}
        </div>

        {/* Section 1: Privacy Settings */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-md)' }}>
            // Leaderboard Visibility
          </h4>
          <div style={{
            padding: '14px',
            background: 'var(--surface-base)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isHidden ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--foss-mint)" />}
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  {isHidden ? 'Incognito Mode (Hidden)' : 'Public Contributor (Visible)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {isHidden
                    ? 'Your rank and XP are calculated privately, but hidden from the public leaderboard.'
                    : 'Your developer rank, level, and badges are visible on the campus leaderboard.'}
                </div>
              </div>
            </div>

            <button
              onClick={handleTogglePrivacy}
              disabled={updatingPrivacy}
              className="btn btn-secondary btn-sm"
              style={{ minWidth: '85px', fontSize: '0.78rem' }}
            >
              {updatingPrivacy ? 'Saving...' : isHidden ? 'Make Public' : 'Hide Profile'}
            </button>
          </div>
        </div>

        {/* Section 2: Danger Zone */}
        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--space-lg)' }}>
          <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--byte-red, #E84A36)', fontFamily: 'var(--font-mono)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} /> // Danger Zone
          </h4>

          {!confirmDelete ? (
            <div style={{
              padding: '14px',
              background: 'rgba(232, 74, 54, 0.05)',
              border: '1px solid rgba(232, 74, 54, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Delete Account & All Data
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Permanently unlinks your GitHub identity, removes all your featured repos, and deletes your XP stats.
                </div>
              </div>
              <button
                onClick={() => setConfirmDelete(true)}
                className="btn btn-danger btn-sm"
                style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={13} />
                Delete Account
              </button>
            </div>
          ) : (
            <div style={{
              padding: '16px',
              background: 'rgba(232, 74, 54, 0.1)',
              border: '1px solid var(--byte-red, #E84A36)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--byte-red, #E84A36)', marginBottom: '6px' }}>
                Are you absolutely sure?
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                This action is irreversible. All your submitted repositories will be removed from the campus radar, your student verification will be revoked, and your session will be ended.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="btn btn-danger btn-sm"
                  disabled={deleting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Trash2 size={13} />
                  {deleting ? 'Deleting Data...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
