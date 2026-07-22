import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, FolderPlus, Save } from 'lucide-react';
import { Project, ProjectCreateInput, ProjectStatus } from '../../types/project';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const projectSchema = z.object({
  project_name: z.string().min(3, 'Project name must be at least 3 characters'),
  client_name: z.string().min(2, 'Client name is required'),
  location: z.string().min(2, 'Location is required'),
  project_type: z.string().min(2, 'Project type is required'),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'PLANNING']),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectCreateInput) => Promise<void>;
  projectToEdit?: Project | null;
  isLoading: boolean;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectToEdit,
  isLoading,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name: '',
      client_name: '',
      location: '',
      project_type: 'Oil & Gas EPC',
      budget: 1000000,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'IN_PROGRESS',
      description: '',
    },
  });

  useEffect(() => {
    if (projectToEdit) {
      reset({
        project_name: projectToEdit.project_name,
        client_name: projectToEdit.client_name,
        location: projectToEdit.location,
        project_type: projectToEdit.project_type,
        budget: projectToEdit.budget,
        start_date: projectToEdit.start_date,
        end_date: projectToEdit.end_date,
        status: projectToEdit.status,
        description: projectToEdit.description || '',
      });
    } else {
      reset({
        project_name: '',
        client_name: '',
        location: '',
        project_type: 'Oil & Gas EPC',
        budget: 1000000,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'IN_PROGRESS',
        description: '',
      });
    }
  }, [projectToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-card w-full max-w-xl rounded-obsidian border border-obsidian-border shadow-glass overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-obsidian-border flex justify-between items-center bg-obsidian-surface/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-obsidian bg-obsidian-emerald/10 border border-obsidian-emerald/30 text-obsidian-emerald">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-obsidian-text-primary">
                {projectToEdit ? 'Edit EPC Project' : 'Create New EPC Project'}
              </h3>
              <p className="text-[11px] text-obsidian-text-muted">Fill project specifications and financial parameters.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-obsidian-text-muted hover:text-obsidian-text-primary rounded-obsidian hover:bg-obsidian-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Project Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-obsidian-text-secondary block">Project Name *</label>
            <input
              type="text"
              {...register('project_name')}
              placeholder="e.g. Al Zour Refinery EPC Phase 1"
              className="w-full px-3.5 py-2 text-xs rounded-obsidian glass-input"
            />
            {errors.project_name && (
              <span className="text-[11px] text-obsidian-danger font-medium">{errors.project_name.message}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-obsidian-text-secondary block">Client Name *</label>
              <input
                type="text"
                {...register('client_name')}
                placeholder="e.g. Kuwait National Petroleum"
                className="w-full px-3.5 py-2 text-xs rounded-obsidian glass-input"
              />
              {errors.client_name && (
                <span className="text-[11px] text-obsidian-danger font-medium">{errors.client_name.message}</span>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-obsidian-text-secondary block">Location *</label>
              <input
                type="text"
                {...register('location')}
                placeholder="e.g. Al Zour, Kuwait"
                className="w-full px-3.5 py-2 text-xs rounded-obsidian glass-input"
              />
              {errors.location && (
                <span className="text-[11px] text-obsidian-danger font-medium">{errors.location.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-obsidian-text-secondary block">Project Category *</label>
              <select
                {...register('project_type')}
                className="w-full px-3.5 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary"
              >
                <option value="Oil & Gas EPC">Oil & Gas EPC</option>
                <option value="Green Hydrogen & Power">Green Hydrogen & Power</option>
                <option value="Infrastructure & Civil">Infrastructure & Civil</option>
                <option value="Solar & Renewable">Solar & Renewable</option>
                <option value="Data Center Construction">Data Center Construction</option>
              </select>
            </div>

            {/* Budget */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-obsidian-text-secondary block">Budget ($ USD) *</label>
              <input
                type="number"
                step="100000"
                {...register('budget', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 text-xs rounded-obsidian glass-input"
              />
              {errors.budget && (
                <span className="text-[11px] text-obsidian-danger font-medium">{errors.budget.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Start Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-obsidian-text-secondary block">Start Date *</label>
              <input
                type="date"
                {...register('start_date')}
                className="w-full px-3 py-2 text-xs rounded-obsidian glass-input"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-obsidian-text-secondary block">Target Completion *</label>
              <input
                type="date"
                {...register('end_date')}
                className="w-full px-3 py-2 text-xs rounded-obsidian glass-input"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-obsidian-text-secondary block">Status *</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary"
              >
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PLANNING">Planning</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-obsidian-text-secondary block">Scope & Specifications Description</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Engineering, procurement, and construction details..."
              className="w-full px-3.5 py-2 text-xs rounded-obsidian glass-input"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-obsidian-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-obsidian-text-secondary hover:text-obsidian-text-primary rounded-obsidian border border-obsidian-border hover:bg-obsidian-card transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold bg-obsidian-emerald text-obsidian-bg rounded-obsidian shadow-emerald-glow hover:opacity-90 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{projectToEdit ? 'Save Changes' : 'Create Project'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
