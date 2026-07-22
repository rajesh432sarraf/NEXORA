import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Sparkles,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { documentService } from '../../services/documentService';
import { ComplianceReport } from '../../types/analytics';
import Skeleton from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const CompliancePage: React.FC = () => {
  const { error: showError } = useToast();

  const [specDocId, setSpecDocId] = useState<string>('');
  const [vendorDocId, setVendorDocId] = useState<string>('');
  const [report, setReport] = useState<ComplianceReport | null>(null);

  // Fetch Documents
  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getDocuments(),
  });

  // Compare Mutation
  const compareMutation = useMutation({
    mutationFn: () => analyticsService.compareCompliance(specDocId, vendorDocId),
    onSuccess: (data) => {
      setReport(data);
    },
    onError: (err: any) => {
      showError('Compliance Check Failed', err.response?.data?.detail || 'Error running compliance evaluation.');
    },
  });

  const handleRunComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specDocId || !vendorDocId) {
      showError('Selection Required', 'Please select both a Project Specification PDF and a Vendor Proposal PDF.');
      return;
    }
    compareMutation.mutate();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-emerald uppercase">
            SPECIFICATION MATRIX
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            Specification Compliance Matrix
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Autonomously compare Vendor Proposals against Project Specs to score compliance and flag missing items.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-obsidian bg-obsidian-card border border-obsidian-emerald/30 shadow-emerald-glow">
          <ShieldCheck className="w-4 h-4 text-obsidian-emerald" />
          <span className="text-xs font-semibold text-obsidian-emerald">Compliance Engine Active</span>
        </div>
      </div>

      {/* Selector Card */}
      <div className="glass-card p-6 rounded-obsidian border border-obsidian-border space-y-4">
        <h3 className="text-sm font-bold text-obsidian-text-primary flex items-center space-x-2">
          <FileText className="w-4 h-4 text-obsidian-emerald" />
          <span>Select Documents for Compliance Evaluation</span>
        </h3>

        <form onSubmit={handleRunComparison} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Spec Doc Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-obsidian-text-secondary block">1. Project Specification PDF</label>
            <select
              value={specDocId}
              onChange={(e) => setSpecDocId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
            >
              <option value="">Select Spec Document...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          </div>

          {/* Vendor Doc Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-obsidian-text-secondary block">2. Vendor Proposal PDF</label>
            <select
              value={vendorDocId}
              onChange={(e) => setVendorDocId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
            >
              <option value="">Select Vendor Proposal...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
          </div>

          {/* Compare Button */}
          <button
            type="submit"
            disabled={compareMutation.isPending || !specDocId || !vendorDocId}
            className="px-6 py-2 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg font-bold text-xs rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {compareMutation.isPending ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Evaluating...</span>
              </span>
            ) : (
              <>
                <span>Run Compliance Check</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results View */}
      {compareMutation.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : report ? (
        <div className="space-y-6">
          {/* Summary Score Card */}
          <div className="glass-panel p-6 rounded-obsidian border border-obsidian-emerald/40 shadow-emerald-glow flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <span className="text-[10px] font-mono text-obsidian-emerald uppercase">EVALUATION SUMMARY</span>
              <h3 className="text-lg font-extrabold text-obsidian-text-primary mt-0.5">
                Compliance Status: <span className={report.overall_score >= 70 ? 'text-obsidian-emerald' : 'text-obsidian-danger'}>{report.status}</span>
              </h3>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-3xl font-black text-obsidian-emerald">{report.overall_score}%</span>
                <span className="text-[10px] text-obsidian-text-muted block">OVERALL MATCH SCORE</span>
              </div>
            </div>
          </div>

          {/* 3 Breakdown Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Missing Requirements */}
            <div className="glass-card p-5 rounded-obsidian border border-obsidian-danger/30 space-y-3">
              <div className="flex items-center space-x-2 border-b border-obsidian-border/60 pb-2">
                <XCircle className="w-4 h-4 text-obsidian-danger" />
                <h4 className="text-xs font-bold text-obsidian-text-primary">
                  Missing Requirements ({report.missing_requirements?.length || 0})
                </h4>
              </div>
              <div className="space-y-2">
                {report.missing_requirements?.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-obsidian bg-obsidian-surface/60 border border-obsidian-danger/20 text-xs text-obsidian-danger">
                    • {typeof item === 'string' ? item : item.item}
                  </div>
                ))}
              </div>
            </div>

            {/* Partial Matches */}
            <div className="glass-card p-5 rounded-obsidian border border-obsidian-warning/30 space-y-3">
              <div className="flex items-center space-x-2 border-b border-obsidian-border/60 pb-2">
                <AlertTriangle className="w-4 h-4 text-obsidian-warning" />
                <h4 className="text-xs font-bold text-obsidian-text-primary">
                  Partial Matches ({report.partial_matches?.length || 0})
                </h4>
              </div>
              <div className="space-y-2">
                {report.partial_matches?.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-obsidian bg-obsidian-surface/60 border border-obsidian-warning/20 text-xs text-obsidian-warning">
                    • {typeof item === 'string' ? item : item.item}
                  </div>
                ))}
              </div>
            </div>

            {/* Full Matches */}
            <div className="glass-card p-5 rounded-obsidian border border-obsidian-emerald/30 space-y-3">
              <div className="flex items-center space-x-2 border-b border-obsidian-border/60 pb-2">
                <CheckCircle2 className="w-4 h-4 text-obsidian-emerald" />
                <h4 className="text-xs font-bold text-obsidian-text-primary">
                  Full Matches ({report.full_matches?.length || 0})
                </h4>
              </div>
              <div className="space-y-2">
                {report.full_matches?.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-obsidian bg-obsidian-surface/60 border border-obsidian-emerald/20 text-xs text-obsidian-emerald">
                    • {typeof item === 'string' ? item : item.item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CompliancePage;
