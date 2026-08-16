import React from 'react';
import { StatsRibbon } from './StatsRibbon';
import { Sparkles, Compass, ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenJoin: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenJoin }) => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-centered">
          <div className="hero-badge">
            <span className="live-dot"></span>
            <span>Genesis Chapter Launch • RIT Kottayam x TinkerHub</span>
          </div>

          <h1 className="hero-title">
            Learn.<br />
            Share.<br />
            <span className="mint-text">Contribute.</span>
          </h1>

          <p className="hero-description">
            The student Free and Open Source Software community at <strong>Rajiv Gandhi Institute of Technology (RIT), Kottayam</strong>, in active collaboration with <strong>TinkerHub</strong>. We help students master Git, Linux, Web, and open-source contributions from ground zero.
          </p>

          <div className="hero-cta-group">
            <button className="btn btn-primary" onClick={onOpenJoin}>
              <Sparkles size={18} />
              Join Founding Cohort
            </button>
            <a href="#events" className="btn btn-secondary">
              <Compass size={18} />
              Explore Bootcamps
            </a>
            <a href="#projects" className="btn btn-ghost">
              Browse Projects <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <StatsRibbon />
      </div>
    </section>
  );
};
