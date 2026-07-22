import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-obsidian-border/60 bg-obsidian-surface/40 backdrop-blur-md py-3 px-6 text-xs text-obsidian-text-muted flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
      <div className="flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-obsidian-emerald animate-pulse"></span>
        <span className="font-semibold text-obsidian-text-secondary">NEXORA Enterprise</span>
        <span>• EPC Intelligence Platform v1.0.0</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="hover:text-obsidian-text-secondary transition-colors cursor-pointer">Security Protocol</span>
        <span className="hover:text-obsidian-text-secondary transition-colors cursor-pointer">API Docs</span>
        <span className="text-obsidian-emerald/80 font-mono text-[11px]">System Status: Operational</span>
      </div>
    </footer>
  );
};

export default Footer;
