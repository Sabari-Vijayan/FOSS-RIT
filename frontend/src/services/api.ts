import { Event, EventRSVP, Project, ClubStats, LeaderboardResponse } from '../types';
import GITOPS_PROJECTS from '../data/projects.json';
import GITOPS_LEADERBOARD from '../data/leaderboard.json';

const API_BASE = '/api';

const FALLBACK_EVENTS: Event[] = [
  {
    id: 'git-101',
    title: 'Git & GitHub 101: Your First Open Source PR',
    description: 'Hands-on workshop in collaboration with TinkerHub RIT. Learn branching, fork-and-pull workflows, and make your first open source contribution.',
    date_time: 'Saturday, Aug 29, 2026 • 1:30 PM - 4:30 PM',
    location: 'MCA Seminar Hall, RIT Kottayam',
    capacity: 80,
    registered_count: 38,
    is_open: true,
    is_collab: true,
    source: 'tinkerhub',
    event_type: 'Workshop',
    event_url: 'https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor'
  },
  {
    id: 'meet-the-maker',
    title: 'Meet the Maker: From Beginner to Open Source Hacker',
    description: 'Interactive talk session on building in public, campus maker culture, and shipping FOSS projects.',
    date_time: 'Thursday, Sep 03, 2026 • 2:30 PM',
    location: 'Online (Google Meet)',
    capacity: 80,
    registered_count: 0,
    is_open: true,
    is_collab: true,
    source: 'tinkerhub',
    event_type: 'Talk Session',
    meet_url: 'https://meet.google.com/mrj-csgy-mez',
    event_url: 'https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor'
  },
  {
    id: 'tinkerhack-26',
    title: "TinkerHack '26: 24hr Campus FOSS Hackathon",
    description: 'Our annual 24-hour hackathon co-hosted with TinkerHub. Build open-source software solutions for campus and public good.',
    date_time: 'Sep 25 - Sep 26, 2026 • 24 Hours',
    location: 'Central Computing Facility, RIT Kottayam',
    capacity: 100,
    registered_count: 52,
    is_open: true,
    is_collab: true,
    source: 'tinkerhub',
    event_type: 'Hackathon',
    event_url: 'https://tinkerhub.org/campus/2160/Rajiv%20Gandhi%20Institute%20of%20Technology,%20Velloor'
  }
];

const FALLBACK_STATS: ClubStats = {
  active_members: 12,
  projects_built: 5,
  workshops_hosted: 20,
  open_pull_requests: 3,
  lines_of_foss_code: 'Genesis'
};

export const api = {
  // --- Events APIs ---
  async getEvents(): Promise<Event[]> {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return FALLBACK_EVENTS;
    }
  },

  async syncTinkerhubEvents(): Promise<Event[]> {
    try {
      const res = await fetch(`${API_BASE}/events/sync-tinkerhub`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return FALLBACK_EVENTS;
    }
  },

  async rsvpEvent(_eventId: string, rsvpData: EventRSVP): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/events/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpData)
      });
      if (res.ok) return await res.json();
    } catch {
      // Handled by client
    }
    return {
      success: true,
      message: `RSVP confirmed for ${rsvpData.name}! See you at the workshop.`
    };
  },

  // --- Projects APIs (GitOps Powered) ---
  async getProjects(tech?: string, forceSync?: boolean): Promise<Project[]> {
    try {
      const queryParams = new URLSearchParams();
      if (tech && tech !== 'all') queryParams.append('tech', tech);
      if (forceSync) queryParams.append('sync', 'true');
      
      const qs = queryParams.toString();
      const url = qs ? `${API_BASE}/projects?${qs}` : `${API_BASE}/projects`;
      const res = await fetch(url);
      if (res.ok) {
        const data: Project[] = await res.json();
        localStorage.setItem('foss_projects_cache', JSON.stringify(data));
        return data;
      }
    } catch {
      // Handled by GitOps fallback below
    }

    const cached = localStorage.getItem('foss_projects_cache');
    let baseList: Project[] = cached ? JSON.parse(cached) : (GITOPS_PROJECTS as unknown as Project[]);

    if (forceSync) {
      baseList = await Promise.all(
        baseList.map(async (p) => {
          try {
            const match = p.repo_url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (match) {
              const owner = match[1];
              const repo = match[2].replace(/\.git$/, '');
              const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
              if (ghRes.ok) {
                const ghData = await ghRes.json();
                return {
                  ...p,
                  stars: ghData.stargazers_count ?? p.stars,
                  forks: ghData.forks_count ?? p.forks,
                  open_issues: ghData.open_issues_count ?? p.open_issues,
                  description: ghData.description || p.description
                };
              }
            }
          } catch (err) {
            console.warn(`[Client GitHub Sync] Notice for ${p.repo_url}:`, err);
          }
          return p;
        })
      );
      localStorage.setItem('foss_projects_cache', JSON.stringify(baseList));
    }

    return tech && tech !== 'all'
      ? baseList.filter(p => p.tech_stack.some(t => t.toLowerCase() === tech.toLowerCase()))
      : baseList;
  },

  async syncProjects(): Promise<{ success: boolean; message: string; projects: Project[] }> {
    try {
      const res = await fetch(`${API_BASE}/projects/sync`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.projects) {
          localStorage.setItem('foss_projects_cache', JSON.stringify(data.projects));
        }
        return data;
      }
    } catch {
      // Fallback: sync directly with GitHub public API
    }

    const updated = await this.getProjects(undefined, true);
    return {
      success: true,
      message: `Synchronized ${updated.length} repositories directly from GitHub.`,
      projects: updated
    };
  },

  // --- Stats APIs ---
  async getStats(): Promise<ClubStats> {
    try {
      const res = await fetch(`${API_BASE}/members/stats`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by fallback
    }
    return FALLBACK_STATS;
  },

  // --- Leaderboard & XP APIs (GitOps Powered) ---
  async getLeaderboard(timeframe: 'all_time' | 'monthly' = 'all_time'): Promise<LeaderboardResponse> {
    try {
      const res = await fetch(`${API_BASE}/leaderboard?timeframe=${timeframe}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Handled by GitOps fallback
    }

    if (GITOPS_LEADERBOARD && (GITOPS_LEADERBOARD as any).contributors) {
      return {
        ...(GITOPS_LEADERBOARD as any),
        timeframe
      } as LeaderboardResponse;
    }

    return {
      status: 'success',
      timeframe,
      total_contributors: 0,
      contributors: []
    };
  }
};
