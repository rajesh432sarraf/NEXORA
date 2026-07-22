import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', label }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 p-4">
      <div
        className={`${sizeClasses[size]} border-obsidian-border border-t-obsidian-emerald rounded-full animate-spin`}
      />
      {label && (
        <span className="text-xs font-medium text-obsidian-text-secondary animate-pulse tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
