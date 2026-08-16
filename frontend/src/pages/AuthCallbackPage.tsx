import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AlertTriangle } from 'lucide-react';
import { GitHubIcon } from '../components/ui/GitHubIcon';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithCode } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const err = searchParams.get('error_description') || searchParams.get('error');

    if (err) {
      setError(err);
      showToast(err, 'error');
      return;
    }

    if (!code) {
      setError('No authorization code provided from GitHub.');
      return;
    }

    const processAuth = async () => {
      try {
        const user = await loginWithCode(code);
        showToast(`Welcome back, @${user.username}!`, 'success');
        navigate('/projects', { replace: true });
      } catch (e: any) {
        setError(e.message || 'Authentication failed');
        showToast(e.message || 'Authentication failed', 'error');
      }
    };

    processAuth();
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-2xl)'
    }}>
      <div style={{
        background: 'var(--open-gray)',
        border: '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-3xl)',
        maxWidth: '460px',
        width: '100%',
        textAlign: 'center'
      }}>
        {error ? (
          <div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 77, 77, 0.1)',
              color: 'var(--flame-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg)'
            }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Authentication Error</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 'var(--space-xl)' }}>
              {error}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Return to Home
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--surface-raised)',
              border: '1px solid var(--surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg)'
            }}>
              <GitHubIcon size={30} className="spin" />
            </div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Authenticating with GitHub...</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Verifying your open-source profile credentials. You will be redirected shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
