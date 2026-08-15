import { Event, EventRSVP, Project, ProjectCreate, Member, MemberCreate, ClubStats } from '../types';

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
    is_open: true
  },
  {
    id: 'linux-cli',
    title: 'Linux & Terminal Essentials for Engineers',
    description: 'Demystifying shell scripting, SSH, package managers, and terminal productivity tools for all engineering branches.',
    date_time: 'Wednesday, Sep 02, 2026 • 4:30 PM - 6:30 PM',
    location: 'CSE Systems Lab, RIT Kottayam',
    capacity: 50,
    registered_count: 24,
    is_open: true
  },
  {
    id: 'tinkerhack-26',
    title: "TinkerHack '26: 24hr Campus FOSS Hackathon",
    description: 'Our inaugural 24-hour hackathon co-hosted with TinkerHub. Build open-source software solutions for campus and public good.',
    date_time: 'Sep 25 - Sep 26, 2026 • 24 Hours',
    location: 'Central Computing Facility, RIT Kottayam',
    capacity: 100,
    registered_count: 52,
    is_open: true
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
    open_issues: 4
  },
  {
    id: 'ktu-calculator',
    name: 'ktu-calculator',
    description: 'Fast, ad-free open-source SGPA/CGPA grade and credit calculator for KTU schemes.',
    repo_url: 'https://github.com/foss-rit/ktu-calculator',
    tech_stack: ['TypeScript', 'React', 'Tailwind'],
    stars: 42,
    forks: 14,
    open_issues: 3
  },
  {
    id: 'tinker-mesh',
    name: 'tinker-mesh',
    description: 'Local LAN peer-to-peer file and resource sharing utility across RIT hostel networks.',
    repo_url: 'https://github.com/foss-rit/tinker-mesh',
    tech_stack: ['Go', 'WebSockets', 'SQLite'],
    stars: 19,
    forks: 5,
    open_issues: 5
  }
];

const FALLBACK_STATS: ClubStats = {
  active_members: 40,
  projects_built: 3,
  workshops_hosted: 0,
  open_pull_requests: 4,
  lines_of_foss_code: 'Genesis'
};

export const api = {
  async getEvents(): Promise<Event[]> {
    try {
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return FALLBACK_EVENTS;
    }
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

  async getProjects(tech?: string): Promise<Project[]> {
    try {
      const url = tech && tech !== 'all' ? `${API_BASE}/projects?tech=${encodeURIComponent(tech)}` : `${API_BASE}/projects`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return tech && tech !== 'all'
        ? FALLBACK_PROJECTS.filter(p => p.tech_stack.some(t => t.toLowerCase() === tech.toLowerCase()))
        : FALLBACK_PROJECTS;
    }
  },

  async submitProject(projectData: ProjectCreate): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit project' }));
      throw new Error(err.detail || 'Failed to submit project');
    }
    return await res.json();
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memberData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to register membership' }));
      throw new Error(err.detail || 'Failed to register membership');
    }
    return await res.json();
  }
};
