import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building2, Calendar, Edit2, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Project, ProjectStatus } from '../../types/project';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const statusBadges: Record<ProjectStatus, { label: string; style: string }> = {
  IN_PROGRESS: { label: 'In Progress', style: 'bg-obsidian-emerald/20 text-obsidian-emerald border-obsidian-emerald/40' },
  COMPLETED: { label: 'Completed', style: 'bg-obsidian-ai/20 text-obsidian-ai border-obsidian-ai/40' },
  ON_HOLD: { label: 'On Hold', style: 'bg-obsidian-warning/20 text-obsidian-warning border-obsidian-warning/40' },
  PLANNING: { label: 'Planning', style: 'bg-obsidian-gold/20 text-obsidian-gold border-obsidian-gold/40' },
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const formatBudget = (budget: number) => {
    if (budget >= 1e9) return `$${(budget / 1e9).toFixed(2)}B`;
    if (budget >= 1e6) return `$${(budget / 1e6).toFixed(1)}M`;
    return `$${budget.toLocaleString()}`;
  };

  // Mock calculation for UI health & progress if not provided
  const progress = project.progress_percentage ?? (project.status === 'COMPLETED' ? 100 : project.status === 'IN_PROGRESS' ? 68 : 25);
  const health = project.health_status ?? (progress > 50 ? 'OPTIMAL' : 'AT_RISK');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-5 rounded-obsidian border border-obsidian-border hover:border-obsidian-emerald/40 transition-all flex flex-col justify-between group relative overflow-hidden"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-obsidian-emerald uppercase">
              {project.project_type || 'EPC CONTRACT'}
            </span>
            <h3 className="text-base font-bold text-obsidian-text-primary tracking-tight mt-0.5 group-hover:text-obsidian-emerald transition-colors line-clamp-1">
              {project.project_name}
            </h3>
          </div>

          {/* Status Badge */}
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${statusBadges[project.status]?.style || statusBadges.IN_PROGRESS.style}`}>
            {statusBadges[project.status]?.label || project.status}
          </span>
        </div>

        {/* Client & Location */}
        <div className="mt-3 space-y-1.5 text-xs text-obsidian-text-secondary">
          <div className="flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-obsidian-text-muted flex-shrink-0" />
            <span className="truncate">{project.client_name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-obsidian-text-muted flex-shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        </div>

        {/* Description if present */}
        {project.description && (
          <p className="text-[11px] text-obsidian-text-muted mt-3 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-obsidian-border/60 space-y-3">
        {/* Budget & Health Row */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[10px] text-obsidian-text-muted block">Contract Budget</span>
            <span className="text-base font-extrabold text-obsidian-text-primary">
              {formatBudget(project.budget)}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-obsidian-surface border border-obsidian-border">
            {health === 'OPTIMAL' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-obsidian-emerald" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-obsidian-warning" />
            )}
            <span className={`text-[10px] font-mono font-semibold ${health === 'OPTIMAL' ? 'text-obsidian-emerald' : 'text-obsidian-warning'}`}>
              {health}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-mono text-obsidian-text-muted mb-1">
            <span>PROGRESS</span>
            <span className="text-obsidian-text-primary font-bold">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-obsidian-surface rounded-full overflow-hidden border border-obsidian-border/50">
            <div
              className="h-full bg-gradient-to-r from-obsidian-emerald to-obsidian-ai rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Timeline Dates & Actions */}
        <div className="flex items-center justify-between text-[11px] text-obsidian-text-muted pt-1">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3 text-obsidian-text-muted" />
            <span>{project.start_date || 'N/A'} - {project.end_date || 'N/A'}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded-obsidian text-obsidian-text-muted hover:text-obsidian-text-primary hover:bg-obsidian-card transition-colors"
              title="Edit Project"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(project)}
              className="p-1.5 rounded-obsidian text-obsidian-text-muted hover:text-obsidian-danger hover:bg-obsidian-danger/10 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
