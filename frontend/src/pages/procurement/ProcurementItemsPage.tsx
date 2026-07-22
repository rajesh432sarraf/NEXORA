import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Truck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FolderKanban,
  DollarSign,
  Package,
  X,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { procurementService } from '../../services/procurementService';
import { projectService } from '../../services/projectService';
import { ProcurementLineItem, ProcurementItemCreateInput, ProcurementStatus } from '../../types/procurement';
import Skeleton from '../../components/common/Skeleton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const itemSchema = z.object({
  item_name: z.string().min(2, 'Item name required (e.g. Stainless Steel Pressure Piping)'),
  project_id: z.string().min(1, 'Project selection required'),
  quantity: z.number().min(0.1, 'Quantity required'),
  unit: z.string().min(1, 'Unit required (e.g. meters, units, tons)'),
  estimated_cost: z.number().min(1, 'Estimated cost required'),
  actual_cost: z.number().optional(),
  status: z.enum(['PENDING', 'ORDERED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  notes: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemSchema>;

const statusStyles: Record<ProcurementStatus, string> = {
  PENDING: 'bg-obsidian-border text-obsidian-text-secondary border-obsidian-border',
  ORDERED: 'bg-obsidian-gold/20 text-obsidian-gold border-obsidian-gold/40',
  SHIPPED: 'bg-obsidian-ai/20 text-obsidian-ai border-obsidian-ai/40',
  DELIVERED: 'bg-obsidian-emerald/20 text-obsidian-emerald border-obsidian-emerald/40',
  CANCELLED: 'bg-obsidian-danger/20 text-obsidian-danger border-obsidian-danger/40',
};

const ProcurementItemsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Procurement Items
  const { data: items = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['procurementItems', selectedProjectId],
    queryFn: () => procurementService.getProcurementItems(selectedProjectId),
  });

  // Fetch Projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Create Item Mutation
  const createMutation = useMutation({
    mutationFn: (data: ProcurementItemCreateInput) => procurementService.createProcurementItem(data),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['procurementItems'] });
      setIsModalOpen(false);
      success('Material Item Registered', `"${newItem.item_name}" added to procurement line.`);
    },
    onError: (err: any) => {
      showError('Failed to Create Item', err.response?.data?.detail || 'Error creating item.');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      item_name: 'Stainless Steel Pressure Piping 12-inch',
      project_id: projects[0]?.id || '',
      quantity: 5000,
      unit: 'meters',
      estimated_cost: 1500000,
      actual_cost: 1420000,
      status: 'ORDERED',
      notes: 'Grade 316L high-pressure piping.',
    },
  });

  const onSubmitForm = (formData: ItemFormData) => {
    createMutation.mutate(formData);
  };

  const projectsMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.project_name));
    return map;
  }, [projects]);

  const filteredItems = useMemo(() => {
    return items.filter((i) => {
      const matchesSearch = i.item_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const totalEst = useMemo(() => items.reduce((acc, curr) => acc + (curr.estimated_cost || 0), 0), [items]);
  const totalAct = useMemo(() => items.reduce((acc, curr) => acc + (curr.actual_cost || curr.estimated_cost || 0), 0), [items]);
  const totalVariance = totalEst - totalAct;

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-copper uppercase">
            BOQ LINE ITEMS & MATERIALS
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            Procurement Line Items
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Track equipment line items, material quantities, estimated vs actual cost variance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-obsidian bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-secondary hover:text-obsidian-text-primary transition-all flex items-center space-x-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-obsidian-copper' : ''}`} />
            <span className="hidden sm:inline">Refresh Items</span>
          </button>

          <button
            onClick={() => {
              reset({
                item_name: '',
                project_id: projects[0]?.id || '',
                quantity: 100,
                unit: 'units',
                estimated_cost: 250000,
                actual_cost: 240000,
                status: 'ORDERED',
                notes: '',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg text-xs font-bold rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Line Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Line Items Count</span>
          <div className="text-2xl font-black text-obsidian-text-primary mt-1">{items.length}</div>
          <span className="text-[11px] text-obsidian-text-secondary mt-1 block">BOQ Materials Tracked</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Total Estimated Cost</span>
          <div className="text-2xl font-black text-obsidian-gold mt-1">{formatCurrency(totalEst)}</div>
          <span className="text-[11px] text-obsidian-gold mt-1 block">Initial Budget Allocation</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Actual Committed Cost</span>
          <div className="text-2xl font-black text-obsidian-emerald mt-1">{formatCurrency(totalAct)}</div>
          <span className="text-[11px] text-obsidian-emerald mt-1 block">Contract Negotiated Cost</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Cost Savings Variance</span>
          <div className={`text-2xl font-black mt-1 flex items-center space-x-1 ${totalVariance >= 0 ? 'text-obsidian-emerald' : 'text-obsidian-danger'}`}>
            {totalVariance >= 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            <span>{formatCurrency(totalVariance)}</span>
          </div>
          <span className="text-[11px] text-obsidian-emerald mt-1 block">
            {totalVariance >= 0 ? 'Cost Savings Realized' : 'Over Budget Variance'}
          </span>
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
            placeholder="Search material item name..."
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
              <option value="ORDERED">Ordered</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Procurement Data Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : filteredItems.length === 0 ? (
        <div className="glass-card p-12 rounded-obsidian border border-obsidian-border text-center space-y-3">
          <Package className="w-10 h-10 text-obsidian-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-obsidian-text-primary">No Line Items Found</h3>
          <p className="text-xs text-obsidian-text-muted max-w-sm mx-auto">
            Click "Add Line Item" above to add BOQ material requirements.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-obsidian border border-obsidian-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-obsidian-border bg-obsidian-surface/60 text-obsidian-text-muted font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4">Material / Item Name</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Quantity & Unit</th>
                  <th className="py-3.5 px-4">Est. Cost</th>
                  <th className="py-3.5 px-4">Actual Cost</th>
                  <th className="py-3.5 px-4">Variance Savings</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-border/50 text-obsidian-text-primary">
                <AnimatePresence>
                  {filteredItems.map((item) => {
                    const variance = item.estimated_cost - (item.actual_cost || item.estimated_cost);
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-obsidian-surface/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <h4 className="text-xs font-bold text-obsidian-text-primary">{item.item_name}</h4>
                          {item.notes && <p className="text-[10px] text-obsidian-text-muted line-clamp-1 mt-0.5">{item.notes}</p>}
                        </td>
                        <td className="py-3.5 px-4 text-obsidian-text-secondary">
                          {projectsMap.get(item.project_id) || 'General EPC Project'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-obsidian-text-primary">
                          {item.quantity.toLocaleString()} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-obsidian-text-muted font-mono">
                          {formatCurrency(item.estimated_cost)}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-obsidian-emerald font-mono">
                          {formatCurrency(item.actual_cost || item.estimated_cost)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span className={variance >= 0 ? 'text-obsidian-emerald' : 'text-obsidian-danger'}>
                            {variance >= 0 ? `+${formatCurrency(variance)}` : `-${formatCurrency(Math.abs(variance))}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${statusStyles[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-obsidian border border-obsidian-border shadow-glass overflow-hidden">
            <div className="px-6 py-4 border-b border-obsidian-border flex justify-between items-center bg-obsidian-surface/60">
              <h3 className="text-sm font-bold text-obsidian-text-primary flex items-center space-x-2">
                <Package className="w-4 h-4 text-obsidian-emerald" />
                <span>Add BOQ Procurement Line Item</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-obsidian-text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-obsidian-text-secondary block">Material / Item Name *</label>
                <input type="text" {...register('item_name')} placeholder="e.g. Stainless Steel Pressure Piping 12-inch" className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
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
                    <option value="ORDERED">ORDERED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Quantity *</label>
                  <input type="number" step="1" {...register('quantity', { valueAsNumber: true })} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Unit of Measurement *</label>
                  <input type="text" {...register('unit')} placeholder="e.g. meters, units, tons" className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Estimated Cost ($) *</label>
                  <input type="number" step="5000" {...register('estimated_cost', { valueAsNumber: true })} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Actual Contract Cost ($)</label>
                  <input type="number" step="5000" {...register('actual_cost', { valueAsNumber: true })} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-obsidian-text-secondary block">Material Grade & Specification Notes</label>
                <textarea {...register('notes')} rows={2} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
              </div>

              <div className="pt-3 border-t border-obsidian-border flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-obsidian-text-secondary border border-obsidian-border rounded-obsidian">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-5 py-2 text-xs font-bold bg-obsidian-emerald text-obsidian-bg rounded-obsidian shadow-emerald-glow">
                  {createMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save Line Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementItemsPage;
