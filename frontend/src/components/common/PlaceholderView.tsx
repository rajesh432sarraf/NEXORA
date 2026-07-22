import React from 'react';
import { Sparkles, Construction } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
  category: string;
  description: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, category, description }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-obsidian-border">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-emerald uppercase">
            {category}
          </span>
          <h1 className="text-2xl font-bold text-obsidian-text-primary tracking-tight mt-1">{title}</h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">{description}</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 rounded-obsidian bg-obsidian-card border border-obsidian-border text-xs text-obsidian-text-secondary flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-obsidian-ai animate-pulse" />
            <span>Phase 1 Architecture Active</span>
          </div>
        </div>
      </div>

      {/* Main Base Card Container */}
      <div className="glass-card p-8 rounded-obsidian border border-obsidian-border text-center flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-14 h-14 rounded-full bg-obsidian-surface border border-obsidian-border flex items-center justify-center mb-4 text-obsidian-emerald shadow-emerald-glow">
          <Construction className="w-7 h-7" />
        </div>

        <h3 className="text-base font-semibold text-obsidian-text-primary">{title} Module Base Ready</h3>
        <p className="text-xs text-obsidian-text-muted max-w-lg mt-2 leading-relaxed">
          The base architecture, obsidian layout, authentication headers, and JWT protected route guard for this module are active and verified. Detailed phase implementation will populate this view.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <span className="px-3 py-1 rounded-full bg-obsidian-surface border border-obsidian-border text-[11px] text-obsidian-text-secondary">
            FastAPI Connected
          </span>
          <span className="px-3 py-1 rounded-full bg-obsidian-surface border border-obsidian-border text-[11px] text-obsidian-emerald">
            JWT Guarded
          </span>
          <span className="px-3 py-1 rounded-full bg-obsidian-surface border border-obsidian-border text-[11px] text-obsidian-ai">
            Obsidian Design System
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderView;
