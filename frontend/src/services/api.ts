import { Event, EventRSVP, Project, ProjectCreate, Member, MemberCreate, ClubStats, AuthResponse, User } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('foss_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

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

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'rit-campushub',
    name: 'rit-campushub',
    description: 'Open-source student notice portal and KTU academic notes directory for RIT Kottayam.',
    repo_url: 'https://github.com/foss-rit/rit-campushub',
    tech_stack: ['React', 'TypeScript', 'FastAPI', 'Python'],
    stars: 28,
    forks: 8,
    open_issues: 4,
    submitted_by_username: 'foss-rit-core'
  },
  {
    id: 'ktu-calculator',
    name: 'ktu-calculator',
    description: 'Fast, ad-free open-source SGPA/CGPA grade and credit calculator for KTU schemes.',
    repo_url: 'https://github.com/foss-rit/ktu-calculator',
    tech_stack: ['TypeScript', 'React', 'Tailwind'],
    stars: 42,
    forks: 14,
    open_issues: 3,
    submitted_by_username: 'foss-rit-core'
  },
  {
    id: 'tinker-mesh',
    name: 'tinker-mesh',
    description: 'Local LAN peer-to-peer file and resource sharing utility across RIT hostel networks.',
    repo_url: 'https://github.com/foss-rit/tinker-mesh',
    tech_stack: ['Go', 'WebSockets', 'SQLite'],
    stars: 19,
    forks: 5,
    open_issues: 5,
    submitted_by_username: 'foss-rit-core'
  }
];

const FALLBACK_STATS: ClubStats = {
  active_members: 42,
  projects_built: 3,
  workshops_hosted: 20,
  open_pull_requests: 12,
  lines_of_foss_code: 'Genesis'
};

export const api = {
  // --- Auth APIs ---
  async getAuthConfig(): Promise<{ github_client_id: string; is_oauth_configured: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/auth/config`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return { github_client_id: '', is_oauth_configured: false };
    }
  },

  async loginWithGitHub(code: string, redirectUri?: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code, 
        redirect_uri: redirectUri || `${window.location.origin}/auth/callback` 
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'GitHub authentication failed' }));
      throw new Error(err.detail || 'GitHub authentication failed');
    }
    return await res.json();
  },

  async devLogin(username: string = 'rit-developer'): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/dev-login?username=${encodeURIComponent(username)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Developer login failed' }));
      throw new Error(err.detail || 'Developer login failed');
    }
    return await res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Unauthenticated');
    return await res.json();
  },

  async verifyStudent(collegeEmail: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/verify-student`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ college_email: collegeEmail })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to verify college email' }));
      throw new Error(err.detail || 'Failed to verify college email');
    }
    return await res.json();
  },

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

  async syncTinkerHub(): Promise<{ success: boolean; message: string; synced_total: number; events: Event[] }> {
    const res = await fetch(`${API_BASE}/events/sync-tinkerhub`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to sync with TinkerHub' }));
      throw new Error(err.detail || 'Failed to sync with TinkerHub');
    }
    return await res.json();
  },

  async rsvpEvent(eventId: string, rsvpData: EventRSVP): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rsvpData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to RSVP' }));
      throw new Error(err.detail || 'Failed to RSVP');
    }
    return await res.json();
  },

  // --- Projects APIs ---
  async getProjects(tech?: string, forceSync?: boolean): Promise<Project[]> {
    try {
      const queryParams = new URLSearchParams();
      if (tech && tech !== 'all') queryParams.append('tech', tech);
      if (forceSync) queryParams.append('sync', 'true');
      
      const qs = queryParams.toString();
      const url = qs ? `${API_BASE}/projects?${qs}` : `${API_BASE}/projects`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Project[] = await res.json();
      // Cache latest project stats locally
      localStorage.setItem('foss_projects_cache', JSON.stringify(data));
      return data;
    } catch {
      // Check for locally cached projects first
      const cached = localStorage.getItem('foss_projects_cache');
      let baseList: Project[] = cached ? JSON.parse(cached) : FALLBACK_PROJECTS;

      // If forceSync is requested and backend is offline, sync directly with GitHub public API
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
              console.warn(`[Client GitHub Sync] Failed to fetch ${p.repo_url}:`, err);
            }
            return p;
          })
        );
        localStorage.setItem('foss_projects_cache', JSON.stringify(baseList));
      }

      return tech && tech !== 'all'
        ? baseList.filter(p => p.tech_stack.some(t => t.toLowerCase() === tech.toLowerCase()))
        : baseList;
    }
  },

  async syncProjects(): Promise<{ success: boolean; message: string; projects: Project[] }> {
    try {
      const res = await fetch(`${API_BASE}/projects/sync`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const projects: Project[] = await res.json();
      localStorage.setItem('foss_projects_cache', JSON.stringify(projects));
      return {
        success: true,
        message: `Successfully synchronized live metrics for ${projects.length} repositories from GitHub!`,
        projects
      };
    } catch {
      // Fallback: Direct GitHub API query from browser
      const cached = localStorage.getItem('foss_projects_cache');
      let list: Project[] = cached ? JSON.parse(cached) : FALLBACK_PROJECTS;

      const synced = await Promise.all(
        list.map(async (p) => {
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
            console.warn(`[Client GitHub Sync] ${p.name}:`, err);
          }
          return p;
        })
      );

      localStorage.setItem('foss_projects_cache', JSON.stringify(synced));
      return {
        success: true,
        message: `Synced ${synced.length} repositories directly from GitHub API.`,
        projects: synced
      };
    }
  },

  async syncSingleProject(projectId: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/sync`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to sync project stats' }));
      throw new Error(err.detail || 'Failed to sync project stats');
    }
    return await res.json();
  },

  async submitProject(projectData: ProjectCreate): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit project' }));
      throw new Error(err.detail || 'Failed to submit project');
    }
    return await res.json();
  },

  async deleteProject(projectId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete project' }));
      throw new Error(err.detail || 'Failed to delete project');
    }
    return await res.json();
  },

  // --- Members & Stats APIs ---
  async getMembers(): Promise<Member[]> {
    try {
      const res = await fetch(`${API_BASE}/members`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  async getStats(): Promise<ClubStats> {
    try {
      const res = await fetch(`${API_BASE}/members/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return FALLBACK_STATS;
    }
  },

  async joinClub(memberData: MemberCreate): Promise<Member> {
    const res = await fetch(`${API_BASE}/members/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(memberData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to register membership' }));
      throw new Error(err.detail || 'Failed to register membership');
    }
    return await res.json();
  }
};
