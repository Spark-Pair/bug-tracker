export type Role = 'developer' | 'user';

export type ReportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ReportSeverity = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  name?: string;
  username: string;
  role: Role;
  password?: string; // In a real app, this would be a hash
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  timestamp: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  app: string;
  page: string;
  url: string;
  description: string;
  screenshots: string[]; // Changed from optional single URL to array of strings (Base64)
  severity: ReportSeverity;
  status: ReportStatus;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  myReports?: number;
}