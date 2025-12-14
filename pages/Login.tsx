import React, { useState } from 'react';
import { useAuth } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../components/UIComponents';
import { Bug } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-bg p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-700/50 p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white mb-6 rotate-3">
              <Bug className="w-7 h-7 text-white dark:text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">BugTracker Pro</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Log in to manage your projects</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="e.g. hasan"
              required
              className="bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white dark:focus:bg-slate-900"
            />
            <Input 
              label="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              className="bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white dark:focus:bg-slate-900"
            />
            
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-3.5 text-base shadow-lg shadow-slate-200 dark:shadow-none" isLoading={loading}>
              Sign In
            </Button>

            <div className="pt-6 text-center">
              <div className="text-xs text-slate-400 font-mono space-y-1">
                <p>Dev: hasan / 1234</p>
                <p>User: alice / password</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};