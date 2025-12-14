import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import { Report, ReportStatus, User } from '../types';
import { Card, StatusBadge, SeverityBadge, Button } from '../components/UIComponents';
import { ArrowLeft, User as UserIcon, Send, ExternalLink, Calendar, Clock, Image } from 'lucide-react';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState<User[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const r = await api.getReportById(id);
        if (!r) {
          navigate('/reports');
          return;
        }
        setReport(r);
        
        if (user?.role === 'developer') {
          const users = await api.getUsers();
          setDevelopers(users.filter(u => u.role === 'developer'));
        }
      } catch (e) {
        console.error("Error loading report", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, user]);

  const handleStatusChange = async (status: ReportStatus) => {
    if (!report) return;
    try {
      await api.updateReportStatus(report.id, status);
      setReport({ ...report, status });
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  const handleAssign = async (devId: string) => {
    if (!report) return;
    const dev = developers.find(d => d.id === devId);
    if (!dev && devId !== "") return;
    
    try {
      await api.assignReport(report.id, devId, dev ? dev.username : "");
      setReport({ ...report, assignedToId: devId, assignedToName: dev ? dev.username : undefined });
    } catch (e) {
      console.error("Failed to assign", e);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !comment.trim()) return;
    try {
      const newComment = await api.addComment(report.id, user!.id, user!.username, comment);
      setReport({ ...report, comments: [...report.comments, newComment] });
      setComment('');
    } catch (e) {
      console.error("Failed to add comment", e);
    }
  };

  if (loading || !report) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="group flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to reports
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {report.app} <span className="text-slate-300 font-light mx-1">/</span> {report.page}
            </h1>
            <StatusBadge status={report.status} />
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">{report.reporterName[0]}</div> {report.reporterName}</span>
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {user?.role === 'developer' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <select 
                className="text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 bg-transparent outline-none hover:border-slate-300 transition-colors"
                value={report.status}
                onChange={(e) => handleStatusChange(e.target.value as ReportStatus)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select 
                className="text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 bg-transparent outline-none hover:border-slate-300 transition-colors"
                value={report.assignedToId || ''}
                onChange={(e) => handleAssign(e.target.value)}
              >
                <option value="">Unassigned</option>
                {developers.map(d => (
                  <option key={d.id} value={d.id}>{d.username}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Description</h3>
              <p className="text-lg text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-light">{report.description}</p>
              
              {report.url && (
                <a href={report.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-6 text-primary font-medium hover:underline">
                  <ExternalLink className="w-4 h-4" /> {report.url}
                </a>
              )}
          </div>

          {report.screenshots && report.screenshots.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Image className="w-4 h-4" /> Attached Screenshots ({report.screenshots.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.screenshots.map((src, idx) => (
                  <div key={idx} className="group relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm aspect-video">
                    <img 
                      src={src} 
                      alt={`Screenshot ${idx + 1}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      onClick={() => window.open(src, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-white font-medium text-sm">Click to view full size</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Discussion</h3>
            <div className="space-y-6 mb-8">
              {report.comments.map(c => (
                <div key={c.id} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
                    {c.authorName.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{c.authorName}</span>
                      <span className="text-xs text-slate-400">{new Date(c.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tl-none inline-block">
                        {c.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {(user?.role === 'developer' || report.status !== 'closed') && (
              <form onSubmit={handleComment} className="flex gap-3 items-center">
                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {user?.username.slice(0, 2).toUpperCase()}
                 </div>
                 <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full pl-5 pr-12 py-3 rounded-full border border-slate-200 dark:border-slate-700 bg-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={!comment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                 </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="sticky top-8 bg-slate-50/50 dark:bg-slate-800/20 backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Metadata</h3>
            <dl className="space-y-6">
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-2">SEVERITY</dt>
                <dd><SeverityBadge severity={report.severity} /></dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-2">ASSIGNED TO</dt>
                <dd className="flex items-center gap-2">
                    {report.assignedToName ? (
                        <>
                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                {report.assignedToName[0].toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{report.assignedToName}</span>
                        </>
                    ) : (
                        <span className="text-sm text-slate-400 italic">No one assigned</span>
                    )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-2">LAST UPDATED</dt>
                <dd className="text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {new Date(report.updatedAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
};