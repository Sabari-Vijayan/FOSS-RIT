import React, { useState } from 'react';
import { X, GitFork, FileCode, GitPullRequest, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface SubmitProjectGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmitProjectGuideModal: React.FC<SubmitProjectGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const templateSnippet = `---
name: "My Awesome Project"
description: "A concise 1-2 sentence description explaining what your project does and the problem it solves."
repo_url: "https://github.com/your-username/your-repo-name"
tech_stack: ["Python", "React", "FastAPI"]
author: "your-github-username"
author_name: "Your Full Name"
is_verified_student: true
batch: "2026"
featured: true
---`;

  const handleCopy = () => {
    navigator.clipboard.writeText(templateSnippet);
    setCopied(true);
    showToast('Markdown template copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-md)' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--foss-mint)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Feature Your Project on Campus Radar</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              // Open Source GitOps Submission (3 Simple Steps)
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', lineHeight: 1.5 }}>
          We use a <strong>Pure GitOps</strong> workflow. Add your project details directly to our GitHub repo via Pull Request to earn XP on the campus leaderboard!
        </p>

        {/* 3 Step Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: 'var(--space-xl)' }}>
          {/* Step 1 */}
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--foss-mint-subtle)', color: 'var(--foss-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                1
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GitFork size={14} color="var(--pixel-blue)" /> Fork this Repository
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Create your personal fork of FOSS-RIT on GitHub.
                </div>
              </div>
            </div>
            <a
              href="https://github.com/vertigotalks7/FOSS-RIT/fork"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Fork Repo</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {/* Step 2 */}
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--foss-mint-subtle)', color: 'var(--foss-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                  2
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileCode size={14} color="var(--byte-yellow)" /> Create Your Markdown File
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Add <code>content/projects/your-project-name.md</code>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
              >
                {copied ? <Check size={12} color="var(--foss-mint)" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>

            <pre style={{
              background: 'var(--surface-base)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              margin: 0,
              overflowX: 'auto',
              border: '1px solid var(--surface-border)'
            }}>
              {templateSnippet}
            </pre>
          </div>

          {/* Step 3 */}
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--foss-mint-subtle)', color: 'var(--foss-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                3
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GitPullRequest size={14} color="var(--foss-mint)" /> Open a Pull Request
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Submit your PR to <code>main</code>. Our team will review & merge it!
                </div>
              </div>
            </div>
            <a
              href="https://github.com/vertigotalks7/FOSS-RIT/compare"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Submit PR</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Need help? Read our <a href="https://github.com/vertigotalks7/FOSS-RIT/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foss-mint)' }}>Contributing Guide</a>
          </span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
