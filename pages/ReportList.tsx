import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import { Report } from '../types';
import { Card, StatusBadge, SeverityBadge } from '../components/UIComponents';
import { Search, Filter, ArrowUpRight } from 'lucide-react';

export const ReportList: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filtered, setFiltered] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const all = await api.getReports();
        const relevant = user?.role === 'developer' 
          ? all 
          : all.filter(r => r.reporterId === user?.id);
        setReports(relevant);
        setFiltered(relevant);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    let result = reports;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.description.toLowerCase().includes(lower) ||
        r.app.toLowerCase().includes(lower) ||
        r.page.toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    setFiltered(result);
  }, [searchTerm, statusFilter, reports]);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading reports...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {user?.role === 'developer' ? 'All Reports' : 'My Reports'}
          </h1>
          <p className="text-slate-500 font-light mt-1">Manage and track issue status</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search reports..."
              className="pl-11 pr-4 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-64 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              className="pl-11 pr-8 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm appearance-none outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <p className="text-slate-400">No reports found.</p>
          </div>
        ) : (
          filtered.map(report => (
            <Link key={report.id} to={`/reports/${report.id}`} className="block">
              <Card className="group hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge status={report.status} />
                      <span className="text-xs font-mono text-slate-400">#{report.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate mb-1">
                      {report.app} <span className="text-slate-400 font-normal mx-2">/</span> {report.page}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 truncate max-w-2xl font-light">
                      {report.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-right md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-6">
                    <div className="flex flex-col items-end gap-1">
                      <SeverityBadge severity={report.severity} />
                      <span className="text-xs text-slate-400 mt-1 font-medium">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};