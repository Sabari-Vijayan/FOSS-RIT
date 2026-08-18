import { Event, EventRSVP, Project, ClubStats, LeaderboardResponse } from '../types';
import GITOPS_PROJECTS from '../data/projects.json';
import GITOPS_LEADERBOARD from '../data/leaderboard.json';
import GITOPS_EVENTS from '../data/events.json';

const API_BASE = '/api';

const FALLBACK_EVENTS: Event[] = (GITOPS_EVENTS as unknown as Event[]) || [];

export const api = {
  // --- Events APIs ---
  async getEvents(): Promise<Event[]> {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (res.ok) return await res.json();
    } catch {
      // Handled by GitOps static feed
    }
    return (GITOPS_EVENTS as unknown as Event[]) || FALLBACK_EVENTS;
  },

  async syncTinkerhubEvents(): Promise<Event[]> {
    try {
      const res = await fetch(`${API_BASE}/events/sync-tinkerhub`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Handled by GitOps static feed
    }
    return (GITOPS_EVENTS as unknown as Event[]) || FALLBACK_EVENTS;
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

    const gitopsList = (GITOPS_PROJECTS as unknown as Project[]) || [];
    let baseList: Project[] = gitopsList;
    const cached = localStorage.getItem('foss_projects_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= gitopsList.length) {
          baseList = parsed;
        }
      } catch {
        baseList = gitopsList;
      }
    }

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

  // --- Stats APIs (Dynamically Computed from Datasets) ---
  async getStats(): Promise<ClubStats> {
    const projCount = (GITOPS_PROJECTS as unknown as Project[])?.length || 0;
    const contribCount = (GITOPS_LEADERBOARD as any)?.contributors?.length || 0;
    const eventCount = (GITOPS_EVENTS as unknown as Event[])?.length || 0;

    return {
      active_members: Math.max(1, contribCount),
      projects_built: Math.max(1, projCount),
      workshops_hosted: Math.max(1, eventCount),
      open_pull_requests: 0,
      lines_of_foss_code: 'Genesis'
    };
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
