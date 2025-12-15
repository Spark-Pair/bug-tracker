import { getFCMToken } from '@/firebase';
import { User, Report, Comment, ReportStatus } from '../types';

export const API_URL = 'https://bug-tracker-backend-cyan.vercel.app';

const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'https://lucide.dev/logo.svg' });
  }
};

export const api = {
  // --------------------
  // Auth
  // --------------------
  login: async (username: string, password: string): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw await res.json();
    const user: User = await res.json();

    const fcmToken = await getFCMToken();
    if (fcmToken && user.id) {
      await fetch(`${API_URL}/users/fcm-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, token: fcmToken })
      });
    }

    return user;
  },

  // --------------------
  // Users
  // --------------------
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  },

  createUser: async (user: Omit<User,'id'> & { password: string }): Promise<User> => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to create user');
    return await res.json();
  },

  resetPassword: async (userId: string) => {
    const res = await fetch(`${API_URL}/users/${userId}/reset-password`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset password');
  },

  // --------------------
  // Reports
  // --------------------
  getReports: async (): Promise<Report[]> => {
    const res = await fetch(`${API_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return await res.json();
  },

  getReportById: async (id: string): Promise<Report | undefined> => {
    const res = await fetch(`${API_URL}/reports/${id}`);
    if (!res.ok) return undefined;
    return await res.json();
  },

  createReport: async (report: Omit<Report,'id'|'createdAt'|'updatedAt'|'comments'|'status'>): Promise<Report> => {
    const res = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    if (!res.ok) throw new Error('Failed to create report');
    return await res.json();
  },

  updateReportStatus: async (id: string, status: ReportStatus): Promise<Report> => {
    const res = await fetch(`${API_URL}/reports/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    const updated = await res.json();
    sendNotification('Status Updated', `Report #${id} is now ${status.replace('_',' ')}`);
    return updated;
  },

  assignReport: async (id: string, userId: string, userName: string): Promise<Report> => {
    const res = await fetch(`${API_URL}/reports/${id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedToId: userId, assignedToName: userName })
    });
    if (!res.ok) throw new Error('Failed to assign report');
    const updated = await res.json();
    sendNotification('Report Assigned', `Report #${id} assigned to ${userName}`);
    return updated;
  },

  addComment: async (reportId: string, authorId: string, authorName: string, message: string): Promise<Comment> => {
    const res = await fetch(`${API_URL}/reports/${reportId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId, authorName, message })
    });
    if (!res.ok) throw new Error('Failed to add comment');
    const newComment = await res.json();
    sendNotification('New Comment', `Report #${reportId}: ${authorName} commented`);
    return newComment;
  }
};
