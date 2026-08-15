import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ClubStats } from '../../types';

export const StatsRibbon: React.FC = () => {
  const [stats, setStats] = useState<ClubStats>({
    active_members: 40,
    projects_built: 3,
    workshops_hosted: 0,
    open_pull_requests: 4,
    lines_of_foss_code: 'Genesis'
  });

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="stats-ribbon">
      <div className="stat-item">
        <div className="stat-number">{stats.active_members}<span>+</span></div>
        <div className="stat-label">Founding Members (RIT)</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">Tinker<span>Hub</span></div>
        <div className="stat-label">Community Partner</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">3<span>+</span></div>
        <div className="stat-label">Upcoming Bootcamps</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">100<span>%</span></div>
        <div className="stat-label">Free & Open Source</div>
      </div>
    </div>
  );
};
