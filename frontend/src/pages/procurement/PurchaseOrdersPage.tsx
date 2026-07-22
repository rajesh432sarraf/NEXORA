import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FolderKanban,
  DollarSign,
  Truck,
  Calendar,
  X,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { procurementService } from '../../services/procurementService';
import { projectService } from '../../services/projectService';
import { PurchaseOrderItem, POCreateInput, POStatus } from '../../types/procurement';
import Skeleton from '../../components/common/Skeleton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

const poSchema = z.object({
  po_number: z.string().min(3, 'PO Number required (e.g. PO-NEOM-8abc5f)'),
  project_id: z.string().min(1, 'Project selection required'),
  vendor_name: z.string().min(2, 'Vendor name required'),
  total_amount: z.number().min(1, 'Total amount required'),
  status: z.enum(['DRAFT', 'ISSUED', 'IN_TRANSIT', 'FULFILLED', 'CANCELLED']),
  issued_date: z.string().min(1, 'Issued date required'),
  delivery_date: z.string().optional(),
  notes: z.string().optional(),
});

type POFormData = z.infer<typeof poSchema>;

const statusStyles: Record<POStatus, string> = {
  DRAFT: 'bg-obsidian-border text-obsidian-text-secondary border-obsidian-border',
  ISSUED: 'bg-obsidian-emerald/20 text-obsidian-emerald border-obsidian-emerald/40',
  IN_TRANSIT: 'bg-obsidian-gold/20 text-obsidian-gold border-obsidian-gold/40 shadow-gold-glow',
  FULFILLED: 'bg-obsidian-ai/20 text-obsidian-ai border-obsidian-ai/40',
  CANCELLED: 'bg-obsidian-danger/20 text-obsidian-danger border-obsidian-danger/40',
};

const PurchaseOrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Purchase Orders
  const { data: pos = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['purchaseOrders', selectedProjectId],
    queryFn: () => procurementService.getPurchaseOrders(selectedProjectId),
  });

  // Fetch Projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Create PO Mutation
  const createMutation = useMutation({
    mutationFn: (data: POCreateInput) => procurementService.createPurchaseOrder(data),
    onSuccess: (newPo) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      setIsModalOpen(false);
      success('Purchase Order Created', `"${newPo.po_number}" issued to ${newPo.vendor_name}.`);
    },
    onError: (err: any) => {
      showError('Failed to Issue PO', err.response?.data?.detail || 'Error creating Purchase Order.');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      po_number: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      project_id: projects[0]?.id || '',
      vendor_name: 'Siemens Energy Global',
      total_amount: 1500000,
      status: 'ISSUED',
      issued_date: new Date().toISOString().split('T')[0],
      delivery_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Turbine transformers and grid integration hardware.',
    },
  });

  const onSubmitForm = (formData: POFormData) => {
    createMutation.mutate(formData);
  };

  const projectsMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.project_name));
    return map;
  }, [projects]);

  const filteredPOs = useMemo(() => {
    return pos.filter((p) => {
      const matchesSearch =
        p.po_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendor_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pos, searchQuery, statusFilter]);

  const totalPOValue = useMemo(
    () => pos.reduce((acc, curr) => acc + (curr.total_amount || 0), 0),
    [pos]
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
          <span className="text-[10px] font-mono tracking-widest text-obsidian-gold uppercase">
            VENDOR ORDERS & LOGISTICS
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            Purchase Orders Dashboard
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Track binding supplier contracts, committed capital values, and shipment delivery ETAs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-obsidian bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-secondary hover:text-obsidian-text-primary transition-all flex items-center space-x-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-obsidian-gold' : ''}`} />
            <span className="hidden sm:inline">Refresh POs</span>
          </button>

          <button
            onClick={() => {
              reset({
                po_number: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
                project_id: projects[0]?.id || '',
                vendor_name: 'Siemens Energy Global',
                total_amount: 1500000,
                status: 'ISSUED',
                issued_date: new Date().toISOString().split('T')[0],
                delivery_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: 'Heavy EPC hardware order.',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg text-xs font-bold rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Total PO Value</span>
          <div className="text-2xl font-black text-obsidian-emerald mt-1">{formatCurrency(totalPOValue)}</div>
          <span className="text-[11px] text-obsidian-emerald mt-1 block">Committed Supplier Capital</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Active PO Orders</span>
          <div className="text-2xl font-black text-obsidian-text-primary mt-1">{pos.length}</div>
          <span className="text-[11px] text-obsidian-text-secondary mt-1 block">Binding Contracts</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">In Transit Logistics</span>
          <div className="text-2xl font-black text-obsidian-gold mt-1">
            {pos.filter((p) => p.status === 'IN_TRANSIT').length}
          </div>
          <span className="text-[11px] text-obsidian-gold mt-1 block">Freight Shipment Active</span>
        </div>

        <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
          <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Fulfilled Orders</span>
          <div className="text-2xl font-black text-obsidian-ai mt-1">
            {pos.filter((p) => p.status === 'FULFILLED').length}
          </div>
          <span className="text-[11px] text-obsidian-ai mt-1 block">Site Delivered & Cleared</span>
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
            placeholder="Search PO number or vendor name..."
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
              <option value="ISSUED">Issued</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="FULFILLED">Fulfilled</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* PO Data Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : filteredPOs.length === 0 ? (
        <div className="glass-card p-12 rounded-obsidian border border-obsidian-border text-center space-y-3">
          <ShoppingBag className="w-10 h-10 text-obsidian-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-obsidian-text-primary">No Purchase Orders Found</h3>
          <p className="text-xs text-obsidian-text-muted max-w-sm mx-auto">
            Click "Create Purchase Order" above to issue an order to a supplier vendor.
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-obsidian border border-obsidian-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-obsidian-border bg-obsidian-surface/60 text-obsidian-text-muted font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4">PO Number & Details</th>
                  <th className="py-3.5 px-4">Vendor Supplier</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Delivery ETA</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-obsidian-border/50 text-obsidian-text-primary">
                <AnimatePresence>
                  {filteredPOs.map((p) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-obsidian-surface/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] text-obsidian-gold font-bold">{p.po_number}</span>
                        {p.notes && <p className="text-[10px] text-obsidian-text-muted line-clamp-1 mt-0.5">{p.notes}</p>}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-obsidian-text-primary flex items-center space-x-1.5">
                        <Building2 className="w-3.5 h-3.5 text-obsidian-emerald" />
                        <span>{p.vendor_name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-obsidian-text-secondary">
                        {projectsMap.get(p.project_id) || 'General EPC Project'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-obsidian-emerald">
                        {formatCurrency(p.total_amount)}
                      </td>
                      <td className="py-3.5 px-4 text-obsidian-text-muted font-mono text-[11px]">
                        {p.delivery_date || 'TBD'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${statusStyles[p.status]}`}>
                          {p.status}
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

      {/* New PO Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-obsidian border border-obsidian-border shadow-glass overflow-hidden">
            <div className="px-6 py-4 border-b border-obsidian-border flex justify-between items-center bg-obsidian-surface/60">
              <h3 className="text-sm font-bold text-obsidian-text-primary flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-obsidian-gold" />
                <span>Issue New Purchase Order (PO)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-obsidian-text-muted hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">PO Number *</label>
                  <input type="text" {...register('po_number')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
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
                <label className="text-xs font-medium text-obsidian-text-secondary block">Vendor / Supplier Name *</label>
                <input type="text" {...register('vendor_name')} placeholder="e.g. Siemens Energy Global" className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Total Amount ($) *</label>
                  <input type="number" step="50000" {...register('total_amount', { valueAsNumber: true })} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Issued Date *</label>
                  <input type="date" {...register('issued_date')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-obsidian-text-secondary block">Status *</label>
                  <select {...register('status')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface">
                    <option value="ISSUED">ISSUED</option>
                    <option value="IN_TRANSIT">IN TRANSIT</option>
                    <option value="FULFILLED">FULFILLED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-obsidian-text-secondary block">Delivery ETA Date</label>
                <input type="date" {...register('delivery_date')} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-obsidian-text-secondary block">PO Hardware Notes</label>
                <textarea {...register('notes')} rows={2} className="w-full px-3 py-2 text-xs rounded-obsidian glass-input" />
              </div>

              <div className="pt-3 border-t border-obsidian-border flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-obsidian-text-secondary border border-obsidian-border rounded-obsidian">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-5 py-2 text-xs font-bold bg-obsidian-gold text-obsidian-bg rounded-obsidian shadow-gold-glow">
                  {createMutation.isPending ? <LoadingSpinner size="sm" /> : 'Issue PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrdersPage;
