import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-full bg-obsidian-warning/10 border border-obsidian-warning/30 flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-obsidian-warning" />
      </div>

      <h1 className="text-4xl font-extrabold text-obsidian-text-primary tracking-tight">403</h1>
      <h2 className="text-lg font-semibold text-obsidian-text-secondary mt-1">Access Restricted</h2>

      <p className="text-xs text-obsidian-text-muted max-w-md mt-2 leading-relaxed">
        Your current role does not have permission to inspect or modify this executive module.
      </p>

      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-primary text-xs font-semibold rounded-obsidian transition-all"
      >
        <ArrowLeft className="w-4 h-4 text-obsidian-emerald" />
        <span>Return to Authorized Area</span>
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
