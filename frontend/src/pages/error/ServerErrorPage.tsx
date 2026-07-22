import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

const ServerErrorPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-obsidian-danger/10 border border-obsidian-danger/30 flex items-center justify-center mb-6">
        <AlertOctagon className="w-8 h-8 text-obsidian-danger" />
      </div>

      <h1 className="text-4xl font-extrabold text-obsidian-text-primary tracking-tight">500</h1>
      <h2 className="text-lg font-semibold text-obsidian-text-secondary mt-1">System Gateway Exception</h2>

      <p className="text-xs text-obsidian-text-muted max-w-md mt-2 leading-relaxed">
        The backend engine encountered an unexpected error. Please check if the FastAPI server (`http://localhost:8000`) is running.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-obsidian-emerald text-obsidian-bg text-xs font-semibold rounded-obsidian shadow-emerald-glow hover:opacity-90 transition-all"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry Connection</span>
      </button>
    </div>
  );
};

export default ServerErrorPage;
