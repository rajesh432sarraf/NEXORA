import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarDays,
  Plus,
  RefreshCw,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { projectService } from '../../services/projectService';
import { MilestoneItem, MilestoneCreateInput, MilestoneStatus } from '../../types/analytics';
import Skeleton from '../../components/common/Skeleton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const milestoneSchema = z.object({
  title: z.string().min(3, 'Milestone title required'),
  project_id: z.string().min(1, 'Project selection required'),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().min(1, 'End date required'),
  progress_percentage: z.number().min(0).max(100),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED']),
  description: z.string().optional(),
});

type MilestoneFormData = z.infer<typeof milestoneSchema>;

const statusStyles: Record<MilestoneStatus, string> = {
  NOT_STARTED: 'bg-obsidian-border text-obsidian-text-secondary border-obsidian-border',
  IN_PROGRESS: 'bg-obsidian-emerald/20 text-obsidian-emerald border-obsidian-emerald/40',
  COMPLETED: 'bg-obsidian-ai/20 text-obsidian-ai border-obsidian-ai/40',
  DELAYED: 'bg-obsidian-danger/20 text-obsidian-danger border-obsidian-danger/40',
};

const TimelinePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Milestones
  const { data: milestones = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['milestones', selectedProjectId],
    queryFn: () => analyticsService.getMilestones(selectedProjectId),
  });

  // Fetch Projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Create Milestone Mutation
  const createMutation = useMutation({
    mutationFn: (data: MilestoneCreateInput) => analyticsService.createMilestone(data),
    onSuccess: (newM) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      setIsModalOpen(false);
      success('Milestone Added', `"${newM.title}" added to project timeline.`);
    },
    onError: (err: any) => {
      showError('Failed to Create Milestone', err.response?.data?.detail || 'Error creating milestone.');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      title: 'Civil Engineering & Site Grading Complete',
      project_id: projects[0]?.id || '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress_percentage: 100,
      status: 'COMPLETED',
      description: 'Heavy foundation work completed for main electrolyzer hall.',
    },
  });

  const onSubmitForm = (formData: MilestoneFormData) => {
    createMutation.mutate(formData);
  };

  const projectsMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.project_name));
    return map;
  }, [projects]);

  const avgProgress = useMemo(() => {
    if (milestones.length === 0) return 0;
    const sum = milestones.reduce((acc, curr) => acc + (curr.progress_percentage || 0), 0);
    return Math.round(sum / milestones.length);
  }, [milestones]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-emerald uppercase">
            SCHEDULE & GANTT MANAGEMENT
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            Timeline & Milestones
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Gantt chart progress tracking, critical path milestones, and completion schedules.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-obsidian bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-secondary hover:text-obsidian-text-primary transition-all flex items-center space-x-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-obsidian-emerald' : ''}`} />
            <span className="hidden sm:inline">Refresh Schedule</span>
          </button>

          <button
            onClick={() => {
              reset({
                title: '',
                project_id: projects[0]?.id || '',
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                progress_percentage: 50,
                status: 'IN_PROGRESS',
                description: '',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg text-xs font-bold rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="glass-card p-5 rounded-obsidian border border-obsidian-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-obsidian bg-obsidian-emerald/10 border border-obsidian-emerald/30 text-obsidian-emerald">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-obsidian-text-primary">Overall EPC Schedule Progress</h3>
            <p className="text-xs text-obsidian-text-muted mt-0.5">Average milestone completion across tracked contracts</p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-2xl font-black text-obsidian-emerald">{avgProgress}%</span>
            <span className="text-[10px] text-obsidian-text-muted block">COMPLETED</span>
          </div>

          <div className="flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-obsidian-emerald" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gantt / Milestones List */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : milestones.length === 0 ? (
        <div className="glass-card p-12 rounded-obsidian border border-obsidian-border text-center space-y-3">
          <CalendarDays className="w-10 h-10 text-obsidian-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-obsidian-text-primary">No Milestones Recorded</h3>
          <p className="text-xs text-obsidian-text-muted max-w-sm mx-auto">
            Click "Add Milestone" above to track key project completion dates.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {milestones.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 rounded-obsidian border border-obsidian-border space-y-3 hover:border-obsidian-emerald/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-obsidian-emerald uppercase">
                      {projectsMap.get(m.project_id) || 'General EPC Contract'}
                    </span>
                    <h4 className="text-sm font-bold text-obsidian-text-primary mt-0.5">{m.title}</h4>
                    {m.description && <p className="text-xs text-obsidian-text-secondary mt-1">{m.description}</p>}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${statusStyles[m.status]}`}>
                      {m.status}
                    </span>
                    <div className="flex items-center space-x-1 text-xs text-obsidian-text-muted font-mono">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>{m.start_date} → {m.end_date}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-obsidian-text-muted">
                    <span>PROGRESS BAR</span>
                    <span className="text-obsidian-emerald font-bold">{m.progress_percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-obsidian-bg rounded-full overflow-hidden border border-obsidian-border">
                    <div
                      className="h-full bg-gradient-to-r from-obsidian-emerald to-obsidian-ai rounded-full transition-all duration-500"
                      style={{ width: `${m.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* New Milestone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-obsidian border border-obsidian-border shadow-glass overflow-hidden">
            <div className="px-6 py-4 border-b border-obsidian-border flex justify-between items-center bg-obsidian-surface/60">
              <h3 className="text-sm font-bold text-obsidian-text-primary flex items-center space-x-2">
                <CalendarDays className="w-4 h-4 text-obsidian-emerald" />
                <span>Add Schedule Milestone</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-obsidian-text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-obsidian-text-secondary block">Milestone Title *</label>
                <input type="text" {...register('title')} placeholder="e.g. Civil Engineering & Site Grading Complete" className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Target Project *</label>
                  <select {...register('project_id')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface">
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.project_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Status *</label>
                  <select {...register('status')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface">
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DELAYED">DELAYED</option>
                    <option value="NOT_STARTED">NOT_STARTED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Start Date *</label>
                  <input type="date" {...register('start_date')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">End Date *</label>
                  <input type="date" {...register('end_date')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Progress (%) *</label>
                  <input type="number" min="0" max="100" {...register('progress_percentage', { valueAsNumber: true })} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-obsidian-text-secondary block">Description</label>
                <textarea {...register('description')} rows={2} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
              </div>

              <div className="pt-3 border-t border-obsidian-border flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-obsidian-text-secondary border border-obsidian-border rounded-obsidian">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-5 py-2 text-xs font-bold bg-obsidian-emerald text-obsidian-bg rounded-obsidian shadow-emerald-glow">
                  {createMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelinePage;
