import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ClubStats } from '../../types';

export const StatsRibbon: React.FC = () => {
  const [stats, setStats] = useState<ClubStats>({
    active_members: 40,
    projects_built: 3,
    workshops_hosted: 20,
    open_pull_requests: 4,
    lines_of_foss_code: 'Genesis'
  });

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="stats-ribbon">
      <div className="stat-item">
        <div className="stat-number">{stats.projects_built}<span>+</span></div>
        <div className="stat-label">Campus FOSS Projects</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">{stats.workshops_hosted || 20}<span>+</span></div>
        <div className="stat-label">TinkerHub RIT Sessions</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">2160</div>
        <div className="stat-label">TinkerHub Chapter ID</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">100<span>%</span></div>
        <div className="stat-label">Free & Open Source</div>
      </div>
    </div>
  );
};
