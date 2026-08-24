import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Quote } from 'lucide-react';

export const ManifestoPage: React.FC = () => {
  return (
    <div style={{ paddingTop: 'var(--space-3xl)', paddingBottom: 'var(--space-4xl)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ paddingLeft: 0 }}>
            <ArrowLeft size={16} /> Back to Overview
          </Link>
        </div>

        {/* Page Banner Header */}
        <div style={{
          background: 'var(--open-gray)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)',
          marginBottom: 'var(--space-2xl)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div>
            <div className="section-tag" style={{ marginBottom: 'var(--space-xs)' }}>
              OUR PHILOSOPHY & VALUES
            </div>
            <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', marginBottom: 'var(--space-sm)' }}>
              The FOSS RIT Manifesto
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
              We believe that knowledge should be free, open, and accessible to everyone. Explore the foundational software freedoms and the Guerilla Open Access Manifesto that guide our community at RIT Kottayam.
            </p>
          </div>
        </div>

        {/* Section 1: The Four Software Freedoms */}
        <section style={{ marginBottom: 'var(--space-3xl)' }}>
          <div style={{
            background: 'var(--open-gray)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-2xl)'
          }}>
            <div className="section-tag">OUR VALUES</div>
            <h2 style={{ marginBottom: 'var(--space-sm)' }}>The Four Software Freedoms</h2>
            <p style={{ marginBottom: 'var(--space-xl)', color: 'var(--text-secondary)', maxWidth: '720px', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Software freedom is about empowering users and communities to control the tools and technology they depend on every day.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-lg)'
            }}>
              <div style={{ padding: 'var(--space-lg)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--foss-mint)' }}>
                <div style={{ color: 'var(--foss-mint)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>FREEDOM 0</div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>The freedom to run the program as you wish, for any purpose.</p>
              </div>

              <div style={{ padding: 'var(--space-lg)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--pixel-blue)' }}>
                <div style={{ color: 'var(--pixel-blue)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>FREEDOM 1</div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>The freedom to study how the program works and adapt it to your needs.</p>
              </div>

              <div style={{ padding: 'var(--space-lg)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--byte-yellow)' }}>
                <div style={{ color: 'var(--byte-yellow)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>FREEDOM 2</div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>The freedom to redistribute copies so you can help your peers.</p>
              </div>

              <div style={{ padding: 'var(--space-lg)', background: 'var(--surface-raised)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--flame-red)' }}>
                <div style={{ color: 'var(--flame-red)', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>FREEDOM 3</div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>The freedom to distribute copies of your modified versions to the public.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Guerilla Open Access Manifesto */}
        <section>
          <div style={{
            background: 'var(--open-gray)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-2xl)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-xs)' }}>
              <Quote className="mint-text" size={24} />
              <div className="section-tag" style={{ margin: 0 }}>HISTORIC DECLARATION</div>
            </div>
            
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', marginBottom: '4px' }}>
              Guerilla Open Access Manifesto
            </h2>
            
            <div style={{ 
              fontSize: '0.95rem', 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--foss-mint)', 
              marginBottom: 'var(--space-2xl)',
              fontWeight: 600
            }}>
              By Aaron Swartz — July 2008, Eremo, Italy
            </div>

            <article style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--space-lg)', 
              fontSize: '1.05rem', 
              lineHeight: 1.7, 
              color: 'var(--text-primary)' 
            }}>
              <p>
                Information is power. But like all power, there are those who want to keep it for themselves. The world's entire scientific and cultural heritage, published over centuries in books and journals, is increasingly being digitized and locked up by a handful of private corporations. Want to read the papers featuring the most famous results of the sciences? You'll need to send enormous amounts to publishers like Reed Elsevier.
              </p>

              <p>
                There are those struggling to change this. The Open Access Movement has fought valiantly to ensure that scientists do not sign their copyrights away but instead ensure their work is published on the Internet, under terms that allow anyone to access it. But even under the best scenarios, their work will only apply to things published in the future. Everything up until now will have been lost.
              </p>

              <p>
                That is too high a price to pay. Forcing academics to pay money to read the work of their colleagues? Scanning entire libraries but only allowing the folks at Google to read them? Providing scientific articles to those at elite universities in the First World, but not to children in the Global South? It's outrageous and unacceptable.
              </p>

              <p style={{
                background: 'var(--surface-raised)',
                padding: 'var(--space-md) var(--space-lg)',
                borderLeft: '4px solid var(--foss-mint)',
                borderRadius: 'var(--radius-sm)',
                fontStyle: 'italic'
              }}>
                "I agree," many say, "but what can we do? The companies hold the copyrights, they make enormous amounts of money by charging for access, and it's perfectly legal — there's nothing we can do to stop them." But there is something we can, something that's already being done: we can fight back.
              </p>

              <p>
                Those with access to these resources — students, librarians, scientists — you have been given a privilege. You get to feed at this banquet of knowledge while the rest of the world is locked out. But you need not — indeed, morally, you cannot — keep this privilege for yourselves. You have a duty to share it with the world. And you have: trading passwords with colleagues, filling download requests for friends.
              </p>

              <p>
                Meanwhile, those who have been locked out are not standing idly by. You have been sneaking through holes and climbing over fences, liberating the information locked up by the publishers and sharing them with your friends.
              </p>

              <p>
                But all of this action goes on in the dark, hidden underground. It's called stealing or piracy, as if sharing a wealth of knowledge were the moral equivalent of plundering a ship and murdering its crew. But sharing isn't immoral — it's a moral imperative. Only those blinded by greed would refuse to let a friend make a copy.
              </p>

              <p>
                Large corporations, of course, are blinded by greed. The laws under which they operate require it — their shareholders would revolt at anything less. And the politicians they have bought off back them, passing laws giving them the exclusive power to decide who can make copies.
              </p>

              <p>
                There is no justice in following unjust laws. It's time to come into the light and, in the grand tradition of civil disobedience, declare our opposition to this private theft of public culture.
              </p>

              <p>
                We need to take information, wherever it is stored, make our copies and share them with the world. We need to take stuff that's out of copyright and add it to the archive. We need to buy secret databases and put them on the Web. We need to download scientific journals and upload them to file sharing networks. We need to fight for Guerilla Open Access.
              </p>

              <p>
                With enough of us, around the world, we'll not just send a strong message opposing the privatization of knowledge — we'll make it a thing of the past.
              </p>

              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--foss-mint)' }}>
                Will you join us?
              </p>

              <div style={{
                marginTop: 'var(--space-md)',
                paddingTop: 'var(--space-md)',
                borderTop: '1px solid var(--surface-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Aaron Swartz</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>July 2008, Eremo, Italy</span>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManifestoPage;
