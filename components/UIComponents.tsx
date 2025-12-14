import React from 'react';
import { ReportStatus, ReportSeverity } from '../types';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}
export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', isLoading, className = '', ...props 
}) => {
  const base = "px-6 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-sm tracking-wide";
  
  // Flat luxury styles, no shadows
  const variants = {
    primary: "bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100", // Monochrome luxury
    secondary: "bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800",
    danger: "bg-danger/10 text-danger hover:bg-danger hover:text-white",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"/> : children}
    </button>
  );
};

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 ml-1">{label}</label>}
    <input 
      className={`w-full px-5 py-3 rounded-2xl border bg-transparent text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400
      ${error 
        ? 'border-danger focus:border-danger' 
        : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary/20'
      } ${className}`} 
      {...props} 
    />
    {error && <p className="text-xs text-danger mt-1 ml-1">{error}</p>}
  </div>
);

// Card - No shadow, just border and radius
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-dark-card rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-6 ${className}`}>
    {children}
  </div>
);

// Badges - Pill shaped
export const StatusBadge: React.FC<{ status: ReportStatus }> = ({ status }) => {
  const styles = {
    open: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/50",
    in_progress: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/50",
    resolved: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-900/50",
    closed: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: ReportSeverity }> = ({ severity }) => {
  const styles = {
    low: "text-slate-500",
    medium: "text-amber-500",
    high: "text-danger font-bold",
  };
  return (
    <span className={`text-xs font-semibold tracking-wider flex items-center gap-1.5 ${styles[severity]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${severity === 'high' ? 'bg-danger' : severity === 'medium' ? 'bg-amber-500' : 'bg-slate-300'}`}></span>
      {severity.toUpperCase()}
    </span>
  );
};