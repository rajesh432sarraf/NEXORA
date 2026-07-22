import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-obsidian-card/70 border border-obsidian-border/40 rounded-obsidian ${className}`}
    />
  );
};

export default Skeleton;
