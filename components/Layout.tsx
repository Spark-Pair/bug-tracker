import React, { useState } from 'react';
import { useAuth } from '../services/auth';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  List, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun,
  Bug
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['developer', 'user'] },
    { path: '/create', label: 'Report Bug', icon: PlusCircle, roles: ['user'] },
    { path: '/reports', label: 'My Reports', icon: List, roles: ['user'] },
    { path: '/reports', label: 'All Reports', icon: List, roles: ['developer'] },
    { path: '/users', label: 'Manage Users', icon: Users, roles: ['developer'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user?.role || ''));

  return (
    <div className="min-h-screen flex bg-background dark:bg-dark-bg transition-colors duration-300">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Floating style on Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 
        md:m-4 md:h-[calc(100vh-2rem)] md:rounded-3xl md:border md:border-slate-200/60 md:dark:border-slate-700/60
        bg-white dark:bg-dark-card
        transform transition-all duration-300 ease-out md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        <div className="h-24 flex items-center px-8">
          <div className="p-2 bg-primary/10 rounded-xl mr-3">
             <Bug className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
            BugTracker
          </span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 px-4 py-2 space-y-2">
          {filteredNav.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-none' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                `}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-current' : 'text-slate-400 group-hover:text-current'}`} />
                <span className="font-medium tracking-wide text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-6 mt-auto">
           <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600">
                    {(user?.name || user?.username || 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold dark:text-white leading-tight">{user?.name || user?.username}</span>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">{user?.role}</span>
                  </div>
                </div>
                <button 
                  onClick={toggleDark}
                  className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-600 text-slate-400 transition-all"
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-danger hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-20 md:hidden flex items-center justify-between px-6 bg-background dark:bg-dark-bg">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <span className="font-bold text-lg dark:text-white">BugTracker</span>
          <div className="w-8" /> 
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto w-full pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};