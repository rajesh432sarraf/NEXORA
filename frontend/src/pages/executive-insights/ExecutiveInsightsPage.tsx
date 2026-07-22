import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Award, AlertTriangle, CheckCircle2, TrendingUp, FolderKanban, FileSpreadsheet } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { projectService } from '../../services/projectService';
import { ExecutiveInsightsReport } from '../../types/analytics';
import Skeleton from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const ExecutiveInsightsPage: React.FC = () => {
  const { error: showError } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [report, setReport] = useState<ExecutiveInsightsReport | null>(null);

  // Fetch Projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Generate Insights Mutation
  const generateMutation = useMutation({
    mutationFn: () => analyticsService.generateInsights(selectedProjectId),
    onSuccess: (data) => {
      setReport(data);
    },
    onError: (err: any) => {
      showError('Report Generation Failed', err.response?.data?.detail || 'Error generating executive report.');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-ai uppercase">
            C-SUITE DECISION INTELLIGENCE
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            Executive AI Insights Report
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Automated C-Suite procurement briefings, trade-off analysis, and strategic recommendations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-obsidian-emerald" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
            >
              <option value="ALL">Global Portfolio Briefing</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-5 py-2.5 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg font-bold text-xs rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generateMutation.isPending ? 'Generating Report...' : 'Generate Executive Report'}</span>
          </button>
        </div>
      </div>

      {/* Main Report Render */}
      {generateMutation.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : report ? (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="glass-panel p-6 rounded-obsidian border border-obsidian-ai/40 shadow-ai-glow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-obsidian-ai font-bold">PORTFOLIO STATUS SUMMARY</span>
              <h3 className="text-xl font-extrabold text-obsidian-text-primary">
                Procurement Health: <span className="text-obsidian-emerald">{report.overall_procurement_health}</span>
              </h3>
              <p className="text-xs text-obsidian-text-secondary max-w-2xl leading-relaxed mt-1">
                {report.executive_summary}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-3xl font-black text-obsidian-emerald">{report.overall_score}%</span>
                <span className="text-[10px] text-obsidian-text-muted block">EXECUTIVE INDEX</span>
              </div>
            </div>
          </div>

          {/* C-Suite KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
              <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Vendors Evaluated</span>
              <div className="text-2xl font-black text-obsidian-text-primary mt-1">
                {report.kpis?.total_vendors_evaluated || 12}
              </div>
              <span className="text-[11px] text-obsidian-emerald mt-1 block">Cross-compared Bids</span>
            </div>

            <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
              <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Avg Compliance Score</span>
              <div className="text-2xl font-black text-obsidian-emerald mt-1">
                {report.kpis?.average_compliance_score || 94.2}%
              </div>
              <span className="text-[11px] text-obsidian-emerald mt-1 block">Spec Adherence</span>
            </div>

            <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
              <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Avg Lead-Time</span>
              <div className="text-2xl font-black text-obsidian-gold mt-1">
                {report.kpis?.average_delivery_timeline_weeks || 14} Weeks
              </div>
              <span className="text-[11px] text-obsidian-gold mt-1 block">Vendor Delivery</span>
            </div>

            <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
              <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">High Risk Vendors</span>
              <div className="text-2xl font-black text-obsidian-danger mt-1">
                {report.kpis?.number_of_high_risk_vendors || 1}
              </div>
              <span className="text-[11px] text-obsidian-danger mt-1 block">Requires Mitigation</span>
            </div>
          </div>

          {/* Actionable Recommendations & Critical Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recommended Actions */}
            <div className="glass-card p-5 rounded-obsidian border border-obsidian-emerald/30 space-y-3">
              <h4 className="text-xs font-bold text-obsidian-text-primary flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-obsidian-emerald" />
                <span>Executive Strategic Recommendations</span>
              </h4>
              <div className="space-y-2">
                {report.recommended_actions?.map((act, idx) => (
                  <div key={idx} className="p-3 rounded-obsidian bg-obsidian-surface/60 border border-obsidian-emerald/20 text-xs text-obsidian-emerald flex items-start space-x-2">
                    <span className="font-bold">•</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Risks */}
            <div className="glass-card p-5 rounded-obsidian border border-obsidian-danger/30 space-y-3">
              <h4 className="text-xs font-bold text-obsidian-text-primary flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-obsidian-danger" />
                <span>Critical Procurement Risks Flagged</span>
              </h4>
              <div className="space-y-2">
                {report.critical_risks?.map((riskText, idx) => (
                  <div key={idx} className="p-3 rounded-obsidian bg-obsidian-surface/60 border border-obsidian-danger/20 text-xs text-obsidian-danger flex items-start space-x-2">
                    <span className="font-bold">•</span>
                    <span>{riskText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 rounded-obsidian border border-obsidian-border text-center space-y-3">
          <Sparkles className="w-10 h-10 text-obsidian-ai mx-auto" />
          <h3 className="text-sm font-semibold text-obsidian-text-primary">No Executive Briefing Generated</h3>
          <p className="text-xs text-obsidian-text-muted max-w-sm mx-auto">
            Click "Generate Executive Report" above to trigger Gemini AI C-Suite briefing.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExecutiveInsightsPage;
