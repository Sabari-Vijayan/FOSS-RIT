import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

export const Manifesto: React.FC = () => {
  return (
    <section id="manifesto" className="section">
      <div className="container">
        <div style={{
          background: 'var(--open-gray)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)'
        }}>
          <div className="section-tag">OUR VALUES</div>
          <h2 style={{ marginBottom: 'var(--space-md)' }}>The Four Software Freedoms</h2>
          <p style={{ marginBottom: 'var(--space-xl)', maxWidth: '700px' }}>
            Software freedom is about empowering users and communities to control the tools and technology they depend on every day.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-2xl)'
          }}>
            <div style={{ padding: 'var(--space-md)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--foss-mint)' }}>
              <div style={{ color: 'var(--foss-mint)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>FREEDOM 0</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>The freedom to run the program as you wish, for any purpose.</p>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--pixel-blue)' }}>
              <div style={{ color: 'var(--pixel-blue)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>FREEDOM 1</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>The freedom to study how the program works and adapt it to your needs.</p>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--byte-yellow)' }}>
              <div style={{ color: 'var(--byte-yellow)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>FREEDOM 2</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>The freedom to redistribute copies so you can help your peers.</p>
            </div>

            <div style={{ padding: 'var(--space-md)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--flame-red)' }}>
              <div style={{ color: 'var(--flame-red)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>FREEDOM 3</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>The freedom to distribute copies of your modified versions to the public.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--surface-border)' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Guerilla Open Access Manifesto</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Read Aaron Swartz's historic declaration on information freedom &amp; open access.</p>
            </div>
            <Link to="/manifesto" className="btn btn-primary">
              <BookOpen size={18} /> Read Full Manifesto <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
