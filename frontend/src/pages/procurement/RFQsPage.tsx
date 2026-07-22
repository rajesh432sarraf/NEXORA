import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FolderKanban,
  DollarSign,
  Calendar,
  X,
  Save,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';
import { procurementService } from '../../services/procurementService';
import { projectService } from '../../services/projectService';
import { RFQItem, RFQCreateInput, RFQStatus } from '../../types/procurement';
import Skeleton from '../../components/common/Skeleton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const rfqSchema = z.object({
  rfq_number: z.string().min(3, 'RFQ Number required (e.g. RFQ-HVAC-001)'),
  title: z.string().min(3, 'Title is required'),
  project_id: z.string().min(1, 'Project selection required'),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  status: z.enum(['DRAFT', 'ISSUED', 'EVALUATING', 'AWARDED', 'CLOSED']),
  due_date: z.string().min(1, 'Due date required'),
  description: z.string().optional(),
});

type RFQFormData = z.infer<typeof rfqSchema>;

const statusStyles: Record<RFQStatus, string> = {
  DRAFT: 'bg-obsidian-border text-obsidian-text-secondary border-obsidian-border',
  ISSUED: 'bg-obsidian-emerald/20 text-obsidian-emerald border-obsidian-emerald/40',
  EVALUATING: 'bg-obsidian-ai/20 text-obsidian-ai border-obsidian-ai/40 shadow-ai-glow',
  AWARDED: 'bg-obsidian-gold/20 text-obsidian-gold border-obsidian-gold/40',
  CLOSED: 'bg-obsidian-surface text-obsidian-text-muted border-obsidian-border',
};

const RFQsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch RFQs
  const { data: rfqs = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['rfqs', selectedProjectId],
    queryFn: () => procurementService.getRFQs(selectedProjectId),
  });

  // Fetch Projects for Selector
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Create RFQ Mutation
  const createMutation = useMutation({
    mutationFn: (data: RFQCreateInput) => procurementService.createRFQ(data),
    onSuccess: (newRfq) => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      setIsModalOpen(false);
      success('RFQ Issued', `"${newRfq.rfq_number}" has been created.`);
    },
    onError: (err: any) => {
      showError('Failed to Create RFQ', err.response?.data?.detail || 'Error creating RFQ.');
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RFQFormData>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      rfq_number: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
      title: '',
      project_id: projects[0]?.id || '',
      budget: 500000,
      status: 'ISSUED',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: '',
    },
  });

  const onSubmitForm = (formData: RFQFormData) => {
    createMutation.mutate(formData);
  };

  const projectsMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.project_name));
    return map;
  }, [projects]);

  const filteredRFQs = useMemo(() => {
    return rfqs.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.rfq_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rfqs, searchQuery, statusFilter]);

  const totalRFQBudget = useMemo(
    () => rfqs.reduce((acc, curr) => acc + (curr.budget || 0), 0),
    [rfqs]
  );

  const formatCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-emerald uppercase">
            PROCUREMENT & TENDERS
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            RFQ Management Center
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Issue, track, and evaluate Requests for Quotations across participating vendors.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-obsidian bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-secondary hover:text-obsidian-text-primary transition-all flex items-center space-x-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-obsidian-emerald' : ''}`} />
            <span className="hidden sm:inline">Refresh RFQs</span>
          </button>

          <button
            onClick={() => {
              reset({
                rfq_number: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
                title: '',
                project_id: projects[0]?.id || '',
                budget: 500000,
                status: 'ISSUED',
                due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                description: '',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg text-xs font-bold rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New RFQ</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Total Active RFQs</span>
          <div className="text-2xl font-black text-obsidian-text-primary mt-1">{rfqs.length}</div>
          <span className="text-[11px] text-obsidian-emerald mt-1 block">Tender Operations</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Issued / Evaluating</span>
          <div className="text-2xl font-black text-obsidian-ai mt-1">
            {rfqs.filter((r) => r.status === 'ISSUED' || r.status === 'EVALUATING').length}
          </div>
          <span className="text-[11px] text-obsidian-ai mt-1 block">Active Vendor Bidding</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Awarded RFQs</span>
          <div className="text-2xl font-black text-obsidian-gold mt-1">
            {rfqs.filter((r) => r.status === 'AWARDED').length}
          </div>
          <span className="text-[11px] text-obsidian-gold mt-1 block">Contract Ready</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Total RFQ Budget</span>
          <div className="text-2xl font-black text-obsidian-text-primary mt-1">{formatCurrency(totalRFQBudget)}</div>
          <span className="text-[11px] text-obsidian-emerald mt-1 block">Tender Value</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 rounded-obsidian border border-obsidian-border flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RFQs by title or RFQ number..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-obsidian glass-input"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Project Selector */}
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

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-obsidian-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="ISSUED">Issued</option>
              <option value="EVALUATING">Evaluating</option>
              <option value="AWARDED">Awarded</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* RFQ Data Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : filteredRFQs.length === 0 ? (
        <div className="glass-card p-12 rounded-obsidian border border-obsidian-border text-center space-y-3">
          <FileSpreadsheet className="w-10 h-10 text-obsidian-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-obsidian-text-primary">No RFQs Found</h3>
          <p className="text-xs text-obsidian-text-muted max-w-sm mx-auto">
            Click "Issue New RFQ" above to create your first Request for Quotation tender.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-obsidian border border-obsidian-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-obsidian-border bg-obsidian-surface/60 text-obsidian-text-muted font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4">RFQ Number & Title</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Tender Budget</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-border/50 text-obsidian-text-primary">
                <AnimatePresence>
                  {filteredRFQs.map((r) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-obsidian-surface/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-obsidian-emerald font-bold">{r.rfq_number}</span>
                        <h4 className="text-xs font-bold text-obsidian-text-primary mt-0.5">{r.title}</h4>
                        {r.description && <p className="text-[10px] text-obsidian-text-muted line-clamp-1">{r.description}</p>}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-obsidian-text-secondary">
                        {projectsMap.get(r.project_id) || 'General EPC Project'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-obsidian-text-primary">
                        {formatCurrency(r.budget)}
                      </td>
                      <td className="py-3.5 px-4 text-obsidian-text-muted font-mono text-[11px]">
                        {r.due_date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${statusStyles[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New RFQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-obsidian border border-obsidian-border shadow-glass overflow-hidden">
            <div className="px-6 py-4 border-b border-obsidian-border flex justify-between items-center bg-obsidian-surface/60">
              <h3 className="text-sm font-bold text-obsidian-text-primary flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-obsidian-emerald" />
                <span>Issue New Request for Quotation (RFQ)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-obsidian-text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">RFQ Number *</label>
                  <input type="text" {...register('rfq_number')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Target Project *</label>
                  <select {...register('project_id')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface">
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.project_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-obsidian-text-secondary block">RFQ Title *</label>
                <input type="text" {...register('title')} placeholder="e.g. 50 Heavy Duty Cooling Towers Procurement" className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Budget ($) *</label>
                  <input type="number" step="10000" {...register('budget', { valueAsNumber: true })} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Due Date *</label>
                  <input type="date" {...register('due_date')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Status *</label>
                  <select {...register('status')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface">
                    <option value="ISSUED">ISSUED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="EVALUATING">EVALUATING</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-obsidian-text-secondary block">Description</label>
                <textarea {...register('description')} rows={2} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
              </div>

              <div className="pt-3 border-t border-obsidian-border flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-obsidian-text-secondary border border-obsidian-border rounded-obsidian">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-5 py-2 text-xs font-bold bg-obsidian-emerald text-obsidian-bg rounded-obsidian shadow-emerald-glow">
                  {createMutation.isPending ? <LoadingSpinner size="sm" /> : 'Issue RFQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQsPage;
