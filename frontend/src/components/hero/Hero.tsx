import React from 'react';
import { Link } from 'react-router-dom';
import { StatsRibbon } from './StatsRibbon';
import { Compass, Layers, ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
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
            <Link to="/projects" className="btn btn-primary">
              <Layers size={18} />
              Explore Campus Projects
            </Link>
            <a href="#events" className="btn btn-secondary">
              <Compass size={18} />
              View Workshops
            </a>
            <a href="#manifesto" className="btn btn-ghost">
              Manifesto <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <StatsRibbon />
      </div>
    </section>
  );
};
