import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../services/auth';
import { Report, DashboardStats } from '../types';
import { Card } from '../components/UIComponents';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const reports = await api.getReports();
        
        const filteredReports = user?.role === 'developer' 
          ? reports 
          : reports.filter(r => r.reporterId === user?.id);

        const stats: DashboardStats = {
          total: filteredReports.length,
          open: filteredReports.filter(r => r.status === 'open').length,
          inProgress: filteredReports.filter(r => r.status === 'in_progress').length,
          resolved: filteredReports.filter(r => ['resolved', 'closed'].includes(r.status)).length,
        };

        setStats(stats);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl" />)}
      </div>
    );
  }

  const chartData = [
    { name: 'Open', value: stats.open, color: '#EF4444' }, // Red
    { name: 'In Progress', value: stats.inProgress, color: '#F59E0B' }, // Amber
    { name: 'Resolved', value: stats.resolved, color: '#10B981' }, // Emerald
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-light">Overview of your project health.</p>
        </div>
        <div className="text-right hidden md:block">
           <span className="text-sm font-medium text-slate-400 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700">
             {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reports" value={stats.total} icon={Activity} color="text-primary" />
        <StatCard title="Open Issues" value={stats.open} icon={AlertCircle} color="text-danger" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="text-warning" />
        <StatCard title="Resolved" value={stats.resolved} icon={CheckCircle} color="text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart */}
        <Card className="lg:col-span-2 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold dark:text-white">Activity</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart */}
        <Card className="min-h-[400px] flex flex-col justify-center items-center">
          <h3 className="text-lg font-semibold mb-4 dark:text-white self-start w-full">
            Distribution
          </h3>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  dataKey="value"
                  cornerRadius={100}
                  paddingAngle={0}              // 🔥 disable padding
                  strokeWidth={6}
                  minAngle={5}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800 dark:text-white">
                {stats.total}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Total
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            {chartData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="text-xs text-slate-500 font-medium">
                  {d.name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.FC<any>; color: string }> = ({ title, value, icon: Icon, color }) => (
  <Card className="flex flex-col justify-between h-40 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {/* Small trend indicator could go here */}
    </div>
    <div>
      <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1 group-hover:scale-105 transition-transform origin-left">{value}</p>
      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</p>
    </div>
  </Card>
);