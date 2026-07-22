import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, Sparkles, Trophy, CheckCircle2, AlertTriangle, Building2, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { analyticsService } from '../../services/analyticsService';
import { procurementService } from '../../services/procurementService';
import { EvaluationReport } from '../../types/analytics';
import Skeleton from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const radarDataSample = [
  { subject: 'Technical Spec', VendorA: 95, VendorB: 88, VendorC: 80 },
  { subject: 'Commercial', VendorA: 81, VendorB: 70, VendorC: 100 },
  { subject: 'Delivery ETA', VendorA: 90, VendorB: 85, VendorC: 75 },
  { subject: 'Risk Safety', VendorA: 100, VendorB: 100, VendorC: 100 },
];

const VendorEvaluationPage: React.FC = () => {
  const { error: showError } = useToast();

  const [rfqId, setRfqId] = useState('');
  const [report, setReport] = useState<EvaluationReport | null>(null);

  // Fetch RFQs
  const { data: rfqs = [] } = useQuery({
    queryKey: ['rfqs'],
    queryFn: () => procurementService.getRFQs(),
  });

  // Evaluate Mutation
  const evalMutation = useMutation({
    mutationFn: () => analyticsService.evaluateVendors(rfqId || 'RFQ-001', []),
    onSuccess: (data) => {
      setReport(data);
    },
    onError: (err: any) => {
      showError('Evaluation Failed', err.response?.data?.detail || 'Error running vendor evaluation.');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-gold uppercase">
            SUPPLIER RANKING ENGINE
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            Vendor Evaluation & Ranking
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Multi-dimensional vendor ranking across Technical Match, Commercial Pricing, Delivery Timelines, and Safety.
          </p>
        </div>

        <button
          onClick={() => evalMutation.mutate()}
          disabled={evalMutation.isPending}
          className="px-5 py-2.5 bg-gradient-to-r from-obsidian-emerald to-obsidian-gold text-obsidian-bg font-bold text-xs rounded-obsidian shadow-gold-glow hover:opacity-95 transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{evalMutation.isPending ? 'Evaluating Bids...' : 'Run Vendor Ranking'}</span>
        </button>
      </div>

      {/* Recommended Vendor Banner */}
      {report && (
        <div className="glass-panel p-6 rounded-obsidian border border-obsidian-gold/40 shadow-gold-glow flex items-center space-x-4">
          <div className="p-3 rounded-obsidian bg-obsidian-gold/10 border border-obsidian-gold/30 text-obsidian-gold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-obsidian-gold font-bold">TOP RECOMMENDED VENDOR</span>
            <h3 className="text-lg font-extrabold text-obsidian-text-primary mt-0.5">
              {report.recommended_vendor}
            </h3>
            <p className="text-xs text-obsidian-text-secondary mt-1">{report.procurement_summary}</p>
          </div>
        </div>
      )}

      {/* Radar Chart & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="glass-card p-5 rounded-obsidian border border-obsidian-border">
          <h3 className="text-sm font-bold text-obsidian-text-primary mb-4 flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-obsidian-gold" />
            <span>Multi-Factor Radar Comparison</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarDataSample}>
                <PolarGrid stroke="#343434" />
                <PolarAngleAxis dataKey="subject" stroke="#A3A3A3" fontSize={11} />
                <PolarRadiusAxis stroke="#A3A3A3" fontSize={10} domain={[0, 100]} />
                <Radar name="Global HVAC Corp" dataKey="VendorA" stroke="#18C29C" fill="#18C29C" fillOpacity={0.4} />
                <Radar name="Speedy Supply LLC" dataKey="VendorB" stroke="#5EF2C7" fill="#5EF2C7" fillOpacity={0.3} />
                <Radar name="Budget Cooling Inc" dataKey="VendorC" stroke="#D6B25E" fill="#D6B25E" fillOpacity={0.2} />
                <Tooltip contentStyle={{ backgroundColor: '#232323', borderColor: '#343434', borderRadius: '14px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Rankings List */}
        <div className="space-y-4">
          {report?.rankings ? (
            report.rankings.map((v, idx) => (
              <div key={idx} className="glass-card p-4 rounded-obsidian border border-obsidian-border space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-obsidian-gold/20 text-obsidian-gold flex items-center justify-center font-bold text-xs border border-obsidian-gold/30">
                      #{v.rank}
                    </span>
                    <h4 className="text-sm font-bold text-obsidian-text-primary">{v.vendor_name}</h4>
                  </div>
                  <span className="text-sm font-black text-obsidian-emerald">{v.overall_score}% Match</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono pt-1 text-obsidian-text-secondary">
                  <div>Tech: <strong className="text-obsidian-text-primary">{v.technical_score}%</strong></div>
                  <div>Comm: <strong className="text-obsidian-text-primary">{v.commercial_score}%</strong></div>
                  <div>Risk: <strong className="text-obsidian-text-primary">{v.risk_score}%</strong></div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-8 rounded-obsidian border border-obsidian-border text-center space-y-2">
              <Award className="w-8 h-8 text-obsidian-gold mx-auto" />
              <p className="text-xs text-obsidian-text-secondary">Click "Run Vendor Ranking" above to evaluate supplier proposals.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorEvaluationPage;
