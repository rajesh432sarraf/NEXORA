import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-obsidian-card border border-obsidian-border flex items-center justify-center mb-6 shadow-glass">
        <Compass className="w-8 h-8 text-obsidian-emerald animate-spin" />
      </div>

      <h1 className="text-4xl font-extrabold text-obsidian-text-primary tracking-tight">404</h1>
      <h2 className="text-lg font-semibold text-obsidian-text-secondary mt-1">Obsidian Node Not Found</h2>

      <p className="text-xs text-obsidian-text-muted max-w-md mt-2 leading-relaxed">
        The requested path or project module coordinate does not exist or has been relocated within the intelligence platform.
      </p>

      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-primary text-xs font-semibold rounded-obsidian transition-all"
      >
        <Home className="w-4 h-4 text-obsidian-emerald" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
