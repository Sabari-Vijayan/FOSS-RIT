import React from 'react';

export const Pillars: React.FC = () => {
  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-header">
          <div>
            <div className="section-tag">// WHY FOSS CLUB</div>
            <h2>Built for Students Who Want to Code for Real</h2>
          </div>
        </div>

        <div className="pillars-grid">
          {/* Pillar 1: Hands-on Bootcamps */}
          <div className="pillar-card interactive-hover-card">
            <div className="pixel-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"></path>
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
                <line x1="8" y1="12" x2="16" y2="12"></line>
                <line x1="8" y1="16" x2="16" y2="16"></line>
              </svg>
            </div>
            <h3 className="pillar-title">Zero to First PR</h3>
            <p className="pillar-desc">
              No prior coding background required. We guide you step-by-step through Git, GitHub branching, command-line basics, and submitting your first pull request.
            </p>
          </div>

          {/* Pillar 2: TinkerHub Learning Circles */}
          <div className="pillar-card interactive-hover-card">
            <div className="pixel-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
            </div>
            <h3 className="pillar-title">TinkerHub Circles</h3>
            <p className="pillar-desc">
              Tap into Kerala's largest tech community network. Join peer learning tracks covering Python, Web, Linux, Open Hardware, and modern dev stacks.
            </p>
          </div>

          {/* Pillar 3: Build for RIT Kottayam */}
          <div className="pillar-card interactive-hover-card">
            <div className="pixel-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
            </div>
            <h3 className="pillar-title">Build for RIT Campus</h3>
            <p className="pillar-desc">
              Help build useful, open-source utilities for our college—like KTU GPA calculators, hostel LAN sharing tools, and student notice portals.
            </p>
          </div>

          {/* Pillar 4: Sprints & Hackathons */}
          <div className="pillar-card interactive-hover-card">
            <div className="pixel-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </div>
            <h3 className="pillar-title">Sprints & Hackathons</h3>
            <p className="pillar-desc">
              Fast-paced campus hackathons and sprint weekends where code is 100% libre. Team up across branches to build and showcase cool projects.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
