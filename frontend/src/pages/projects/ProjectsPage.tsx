import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderPlus,
  Search,
  LayoutGrid,
  List,
  Filter,
  RefreshCw,
  Building2,
  MapPin,
  Edit2,
  Trash2,
  Calendar,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { Project, ProjectCreateInput, ProjectStatus } from '../../types/project';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Skeleton from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const statusBadges: Record<ProjectStatus, { label: string; style: string }> = {
  IN_PROGRESS: { label: 'In Progress', style: 'bg-obsidian-emerald/20 text-obsidian-emerald border-obsidian-emerald/40' },
  COMPLETED: { label: 'Completed', style: 'bg-obsidian-ai/20 text-obsidian-ai border-obsidian-ai/40' },
  ON_HOLD: { label: 'On Hold', style: 'bg-obsidian-warning/20 text-obsidian-warning border-obsidian-warning/40' },
  PLANNING: { label: 'Planning', style: 'bg-obsidian-gold/20 text-obsidian-gold border-obsidian-gold/40' },
};

const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // React Query Fetch Projects
  const { data: projects = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Create Project Mutation
  const createMutation = useMutation({
    mutationFn: (data: ProjectCreateInput) => projectService.createProject(data),
    onSuccess: (newProj) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      success('Project Created', `"${newProj.project_name}" has been registered.`);
    },
    onError: (err: any) => {
      showError('Failed to Create Project', err.response?.data?.detail || 'An error occurred.');
    },
  });

  // Update Project Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectCreateInput }) =>
      projectService.updateProject(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setEditingProject(null);
      success('Project Updated', `"${updated.project_name}" has been updated.`);
    },
    onError: (err: any) => {
      showError('Failed to Update Project', err.response?.data?.detail || 'An error occurred.');
    },
  });

  // Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeletingProject(null);
      success('Project Deleted', 'Project node removed safely.');
    },
    onError: (err: any) => {
      showError('Failed to Delete Project', err.response?.data?.detail || 'An error occurred.');
    },
  });

  // Unique Dropdown Options
  const clientOptions = useMemo(() => {
    const clients = Array.from(new Set(projects.map((p) => p.client_name).filter(Boolean)));
    return ['ALL', ...clients];
  }, [projects]);

  const locationOptions = useMemo(() => {
    const locations = Array.from(new Set(projects.map((p) => p.location).filter(Boolean)));
    return ['ALL', ...locations];
  }, [projects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesClient = clientFilter === 'ALL' || p.client_name === clientFilter;
      const matchesLocation = locationFilter === 'ALL' || p.location === locationFilter;

      return matchesSearch && matchesStatus && matchesClient && matchesLocation;
    });
  }, [projects, searchQuery, statusFilter, clientFilter, locationFilter]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData: ProjectCreateInput) => {
    if (editingProject) {
      await updateMutation.mutateAsync({ id: editingProject.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingProject) {
      await deleteMutation.mutateAsync(deletingProject.id);
    }
  };

  const formatBudget = (budget: number) => {
    if (budget >= 1e9) return `$${(budget / 1e9).toFixed(2)}B`;
    if (budget >= 1e6) return `$${(budget / 1e6).toFixed(1)}M`;
    return `$${budget.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-emerald uppercase">
            PORTFOLIO MANAGEMENT
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            EPC Project Nodes
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Overview and controls for all active, planned, and completed engineering contracts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-obsidian bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-secondary hover:text-obsidian-text-primary transition-all flex items-center space-x-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-obsidian-emerald' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg text-xs font-bold rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center space-x-2"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Project Node</span>
          </button>
        </div>
      </div>

      {/* 2. Controls, Search & Filter Bar */}
      <div className="glass-card p-4 rounded-obsidian border border-obsidian-border flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project name, client, or location..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-obsidian glass-input"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-obsidian-text-muted hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PLANNING">Planning</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
          >
            <option value="ALL">All Clients</option>
            {clientOptions.filter((c) => c !== 'ALL').map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
          >
            <option value="ALL">All Locations</option>
            {locationOptions.filter((l) => l !== 'ALL').map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          {/* View Toggle (Grid / List) */}
          <div className="flex items-center space-x-1 p-1 rounded-obsidian bg-obsidian-surface border border-obsidian-border ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-obsidian text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-obsidian-card text-obsidian-emerald border border-obsidian-emerald/40'
                  : 'text-obsidian-text-muted hover:text-obsidian-text-primary'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-obsidian text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-obsidian-card text-obsidian-emerald border border-obsidian-emerald/40'
                  : 'text-obsidian-text-muted hover:text-obsidian-text-primary'
              }`}
              title="List Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Project Content Render (Grid vs List vs Skeleton) */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card p-12 rounded-obsidian border border-obsidian-border text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-obsidian-surface border border-obsidian-border flex items-center justify-center mx-auto text-obsidian-text-muted">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-obsidian-text-primary">No Projects Match Your Criteria</h3>
          <p className="text-xs text-obsidian-text-muted max-w-sm mx-auto">
            Try adjusting your search terms or status filters, or click "New Project Node" to register a new contract.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setClientFilter('ALL');
              setLocationFilter('ALL');
            }}
            className="px-4 py-2 text-xs font-semibold text-obsidian-emerald bg-obsidian-card hover:bg-obsidian-border border border-obsidian-emerald/30 rounded-obsidian transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleOpenEditModal}
                onDelete={(p) => setDeletingProject(p)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* LIST TABLE VIEW */
        <div className="glass-card rounded-obsidian border border-obsidian-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-obsidian-border bg-obsidian-surface/60 text-obsidian-text-muted font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-border/50 text-obsidian-text-primary">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-obsidian-surface/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-obsidian-text-primary">
                      {p.project_name}
                      <span className="block text-[10px] font-normal text-obsidian-text-muted">{p.project_type}</span>
                    </td>
                    <td className="py-3 px-4 text-obsidian-text-secondary">{p.client_name}</td>
                    <td className="py-3 px-4 text-obsidian-text-secondary">{p.location}</td>
                    <td className="py-3 px-4 font-bold text-obsidian-emerald">{formatBudget(p.budget)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusBadges[p.status]?.style || statusBadges.IN_PROGRESS.style}`}>
                        {statusBadges[p.status]?.label || p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-obsidian-text-muted font-mono text-[11px]">
                      {p.start_date} → {p.end_date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-obsidian text-obsidian-text-muted hover:text-obsidian-text-primary hover:bg-obsidian-card transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProject(p)}
                          className="p-1.5 rounded-obsidian text-obsidian-text-muted hover:text-obsidian-danger hover:bg-obsidian-danger/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleFormSubmit}
        projectToEdit={editingProject}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDeleteConfirm}
        project={deletingProject}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ProjectsPage;
