export interface User {
  id: string;
  username: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  college_email?: string;
  is_verified_student: boolean;
  role: string;
  created_at?: string;
}

export interface DeveloperBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ContributorRank {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_verified_student: boolean;
  role: string;
  rank: number;
  medal?: '🥇' | '🥈' | '🥉' | null;
  xp: number;
  level: number;
  title: string;
  min_xp: number;
  max_xp: number;
  progress: number;
  total_projects: number;
  total_stars: number;
  total_forks: number;
  top_projects: string[];
  badges: DeveloperBadge[];
  joined_at?: string;
}

export interface LeaderboardResponse {
  timeframe: 'all_time' | 'monthly';
  total_contributors: number;
  contributors: ContributorRank[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  github_username?: string;
  department: string;
  year_of_study: number;
  is_verified_student?: boolean;
  joined_at?: string;
}

export interface MemberCreate {
  name: string;
  email: string;
  github_username?: string;
  department: string;
  year_of_study: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  date?: string;
  time?: string;
  venue?: string;
  capacity: number;
  registered_count: number;
  is_open?: boolean;
  is_collab?: boolean;
  source?: string;
  banner_url?: string;
  event_type?: string;
  meet_url?: string;
  event_url?: string;
  registration_link?: string;
}

export interface EventRSVP {
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repo_url: string;
  tech_stack: string[];
  stars: number;
  forks: number;
  open_issues: number;
  submitted_by_username?: string;
  is_verified_student?: boolean;
  last_synced_at?: string;
}

export interface ProjectCreate {
  repo_url: string;
  name?: string;
  description?: string;
}

export interface ClubStats {
  active_members: number;
  projects_built: number;
  workshops_hosted: number;
  open_pull_requests: number;
  lines_of_foss_code: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error';
}
