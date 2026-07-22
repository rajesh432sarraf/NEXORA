import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight, FolderKanban } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { projectService } from '../../services/projectService';
import { RiskReport } from '../../types/analytics';
import Skeleton from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const RiskPage: React.FC = () => {
  const { error: showError } = useToast();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [report, setReport] = useState<RiskReport | null>(null);

  // Fetch Projects
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Predict Risk Mutation
  const riskMutation = useMutation({
    mutationFn: () => analyticsService.predictRisk(selectedProjectId),
    onSuccess: (data) => {
      setReport(data);
    },
    onError: (err: any) => {
      showError('Risk Prediction Failed', err.response?.data?.detail || 'Error analyzing risk profile.');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-danger uppercase">
            PREDICTIVE RISK ENGINE
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            Procurement Risk Intelligence
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            AI supply chain risk scoring across delivery delays, single-source dependency, and technical specs.
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
              <option value="ALL">Global EPC Risk Profile</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => riskMutation.mutate()}
            disabled={riskMutation.isPending}
            className="px-5 py-2 bg-gradient-to-r from-obsidian-danger to-obsidian-gold text-obsidian-bg font-bold text-xs rounded-obsidian shadow-danger-glow hover:opacity-95 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{riskMutation.isPending ? 'Predicting...' : 'Evaluate Risk'}</span>
          </button>
        </div>
      </div>

      {/* Main Risk Dashboard */}
      {riskMutation.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : report ? (
        <div className="space-y-6">
          {/* Risk Level Banner */}
          <div className="glass-panel p-6 rounded-obsidian border border-obsidian-danger/40 shadow-danger-glow flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-obsidian bg-obsidian-danger/10 border border-obsidian-danger/30 text-obsidian-danger">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-obsidian-danger font-bold">PREDICTIVE RISK LEVEL</span>
                <h3 className="text-xl font-extrabold text-obsidian-text-primary mt-0.5">
                  Overall Profile: <span className="text-obsidian-danger">{report.overall_risk_level} Risk</span>
                </h3>
                <p className="text-xs text-obsidian-text-secondary mt-1">{report.executive_summary}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black text-obsidian-danger">{report.overall_risk_score}/100</span>
              <span className="text-[10px] text-obsidian-text-muted block">RISK SCORE INDEX</span>
            </div>
          </div>

          {/* Sub-Risk Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
              <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Delivery Logistics</span>
              <div className="text-2xl font-black text-obsidian-warning mt-1">{report.delivery_risk}%</div>
              <span className="text-[11px] text-obsidian-warning mt-1 block">Lead-time Variance</span>
            </div>

            <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
              <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Technical Specs</span>
              <div className="text-2xl font-black text-obsidian-emerald mt-1">{report.technical_risk}%</div>
              <span className="text-[11px] text-obsidian-emerald mt-1 block">Spec Conformity</span>
            </div>

            <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
              <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Commercial Pricing</span>
              <div className="text-2xl font-black text-obsidian-gold mt-1">{report.commercial_risk}%</div>
              <span className="text-[11px] text-obsidian-gold mt-1 block">Cost Inflation Volatility</span>
            </div>

            <div className="glass-card p-4 rounded-obsidian border border-obsidian-border">
              <span className="text-[11px] font-semibold text-obsidian-text-muted uppercase">Safety & Regulatory</span>
              <div className="text-2xl font-black text-obsidian-ai mt-1">{report.compliance_risk}%</div>
              <span className="text-[11px] text-obsidian-ai mt-1 block">ISO/Safety Standard</span>
            </div>
          </div>

          {/* Identified Risks & AI Mitigations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identified Risks */}
            <div className="glass-card p-5 rounded-obsidian border border-obsidian-danger/30 space-y-3">
              <h4 className="text-xs font-bold text-obsidian-text-primary flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-obsidian-danger" />
                <span>Identified Supply Chain Risks</span>
              </h4>
              <div className="space-y-2">
                {report.identified_risks?.map((rText, idx) => (
                  <div key={idx} className="p-3 rounded-obsidian bg-obsidian-surface/60 border border-obsidian-danger/20 text-xs text-obsidian-danger flex items-start space-x-2">
                    <span className="font-bold">•</span>
                    <span>{rText}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Mitigations */}
            <div className="glass-card p-5 rounded-obsidian border border-obsidian-emerald/30 space-y-3">
              <h4 className="text-xs font-bold text-obsidian-text-primary flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-obsidian-emerald" />
                <span>Gemini Recommended Mitigations</span>
              </h4>
              <div className="space-y-2">
                {report.mitigations?.map((mText, idx) => (
                  <div key={idx} className="p-3 rounded-obsidian bg-obsidian-surface/60 border border-obsidian-emerald/20 text-xs text-obsidian-emerald flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{mText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 rounded-obsidian border border-obsidian-border text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-obsidian-danger mx-auto" />
          <h3 className="text-sm font-semibold text-obsidian-text-primary">No Risk Assessment Loaded</h3>
          <p className="text-xs text-obsidian-text-muted max-w-sm mx-auto">
            Click "Evaluate Risk" above to analyze supply chain risk vectors.
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskPage;
