import React, { useEffect, useState } from 'react';
import { Bell, BellOff, ArrowRight } from 'lucide-react';
import { Button } from './UIComponents';

export const NotificationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (permission === 'granted') setGranted(true);
  }, [permission]);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (granted) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-100/50 dark:bg-red-900/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-100/50 dark:bg-amber-900/10 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-md relative z-10 text-center">
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-700/50 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-8">
            {permission === 'denied' ? (
              <BellOff className="w-10 h-10 text-danger" />
            ) : (
              <Bell className="w-10 h-10 text-slate-900 dark:text-white animate-pulse" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {permission === 'denied' ? 'Access Blocked' : 'Enable Notifications'}
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
            {permission === 'denied' 
              ? "This application requires push notifications. You have blocked notifications in your browser settings. Reset permissions for this site to continue."
              : "To provide real-time updates, this app requires push notifications. You cannot proceed without allowing."}
          </p>

          {permission === 'default' && (
            <Button onClick={requestPermission} className="w-full py-4 text-base shadow-xl shadow-primary/20">
              Allow Notifications <ArrowRight className="w-4 h-4" />
            </Button>
          )}

          {permission === 'denied' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 text-left">
              <strong>How to fix:</strong>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Click the lock icon 🔒 in your browser URL bar.</li>
                <li>Find "Notifications" and change "Block" to "Ask" or "Allow".</li>
                <li>Refresh this page.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
