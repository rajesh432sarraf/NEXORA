import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign,
  FolderKanban,
  FileText,
  Users,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import Skeleton from '../../components/common/Skeleton';

// Mock trend and chart data for EPC analytics visualization
const budgetTrendData = [
  { month: 'Jan', budget: 12.4, spend: 10.1 },
  { month: 'Feb', budget: 18.2, spend: 14.8 },
  { month: 'Mar', budget: 24.5, spend: 21.0 },
  { month: 'Apr', budget: 31.0, spend: 28.4 },
  { month: 'May', budget: 38.6, spend: 34.2 },
  { month: 'Jun', budget: 44.0, spend: 39.5 },
];

const vendorScoresData = [
  { name: 'Siemens Energy', technical: 95, commercial: 88, compliance: 98 },
  { name: 'GE Power', technical: 92, commercial: 84, compliance: 90 },
  { name: 'Schneider Electric', technical: 89, commercial: 91, compliance: 94 },
  { name: 'ABB Heavy Ind.', technical: 86, commercial: 79, compliance: 85 },
];

const timelineProgressData = [
  { name: 'Al Zour Refinery', progress: 85 },
  { name: 'NEOM Green H2', progress: 62 },
  { name: 'Jubail Petrochem', progress: 94 },
  { name: 'Riyadh Solar Ph3', progress: 45 },
];

const riskDistributionData = [
  { name: 'Low Risk', value: 65, color: '#4A8A6A' },
  { name: 'Medium Risk', value: 25, color: '#C9964A' },
  { name: 'High Risk', value: 10, color: '#C0504A' },
];

const recentActivities = [
  {
    id: '1',
    time: '10 mins ago',
    title: 'AI Spec Extraction Completed',
    description: "al_zour_spec.pdf parsed: 50 Heavy Duty Cooling Towers & 4x100MW Turbines identified.",
    badge: 'PARSED',
    type: 'ai'
  },
  {
    id: '2',
    time: '45 mins ago',
    title: 'Purchase Order Issued',
    description: 'PO-NEOM-8abc5f issued to Siemens Energy Global ($45.0M).',
    badge: 'PO ISSUED',
    type: 'po'
  },
  {
    id: '3',
    time: '2 hours ago',
    title: 'Vendor Compliance Verified',
    description: 'Global HVAC Corp scored 86.69% match against spec requirements.',
    badge: 'COMPLIANCE',
    type: 'check'
  },
];

const criticalAlerts = [
  {
    id: 'a1',
    severity: 'CRITICAL',
    title: 'Transformer Shipping Delay Flagged',
    project: 'NEOM Green Hydrogen Phase 1',
    impact: 'Potential 18-day schedule delay on main electrolyzer energization.',
    action: 'Expedite vendor route or invoke secondary supplier.'
  },
  {
    id: 'a2',
    severity: 'HIGH',
    title: 'Warranty Term Deviation Identified',
    project: 'Al Zour Refinery EPC',
    impact: 'Vendor proposal offers 3-year limited warranty vs 5-year required spec.',
    action: 'Hold 10% payment milestone pending warranty alignment.'
  }
];

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getStats,
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0.00';
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
    return `$${amount.toLocaleString()}`;
  };

  const projectStatusData = [
    { name: 'In Progress', value: stats?.active_projects || 0, color: '#4A8A6A' },
    { name: 'Completed', value: stats?.completed_projects || 0, color: '#7DAF95' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Live Controller */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: '#4A8A6A' }}
            >
              C-SUITE INTELLIGENCE
            </span>
            <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#4A8A6A' }}></span>
          </div>
          <h1
            className="text-2xl md:text-3xl font-extrabold tracking-tight mt-0.5"
            style={{
              background: 'linear-gradient(135deg, #1C2E22, #4A8A6A, #7DAF95)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Executive Command Center
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Real-time EPC project metrics, AI RAG document insights, and procurement health telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(74,138,106,0.15), rgba(125,175,149,0.1))',
              border: '1px solid rgba(74,138,106,0.35)',
              boxShadow: '0 0 12px rgba(74,138,106,0.15)'
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: '#4A8A6A' }} />
            <span className="text-xs font-bold" style={{ color: '#2D6B4A' }}>Gemini 1.5 Pro Online</span>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="px-4 py-2 rounded-xl flex items-center space-x-2 text-xs font-bold text-white transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #4A8A6A, #5A9178)',
              boxShadow: '0 2px 10px rgba(74,138,106,0.25)'
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          className="glass-card p-4 rounded-xl border relative overflow-hidden group cursor-pointer hover-glow-sage"
          style={{ border: '1px solid rgba(74,138,106,0.2)' }}
        >
          {/* Top accent border line */}
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #4A8A6A, #7DAF95)' }} />
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-obsidian-text-muted uppercase tracking-wider">Total Budget</span>
            <div className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(74,138,106,0.12)', border: '1px solid rgba(74,138,106,0.25)', color: '#4A8A6A' }}>
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <span className="text-2xl font-black tracking-tight text-gradient-sage">
                {formatCurrency(stats?.total_budget)}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center space-x-1 text-[11px] font-semibold" style={{ color: '#4A8A6A' }}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% allocated</span>
          </div>
        </motion.div>

        {/* KPI 2: Active Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="glass-card p-4 rounded-xl relative overflow-hidden group cursor-pointer hover-glow-amber"
          style={{ border: '1px solid rgba(201,150,74,0.2)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #C9964A, #E8C080)' }} />
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-obsidian-text-muted uppercase tracking-wider">Projects</span>
            <div className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(201,150,74,0.12)', border: '1px solid rgba(201,150,74,0.25)', color: '#C9964A' }}>
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-black tracking-tight text-gradient-amber">
                {stats?.total_projects || 0}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center space-x-1 text-[11px] font-semibold" style={{ color: '#C9964A' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#4A8A6A' }}></span>
            <span>{stats?.active_projects || 0} Active In-Progress</span>
          </div>
        </motion.div>

        {/* KPI 3: Processed Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="glass-card p-4 rounded-xl relative overflow-hidden group cursor-pointer hover-glow-sage"
          style={{ border: '1px solid rgba(74,138,106,0.2)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #5A9178, #CBD8D2)' }} />
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-obsidian-text-muted uppercase tracking-wider">Doc Specs</span>
            <div className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(90,145,120,0.12)', border: '1px solid rgba(90,145,120,0.25)', color: '#5A9178' }}>
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-black tracking-tight text-gradient-sage">
                {stats?.total_documents || 0}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center space-x-1 text-[11px] font-semibold" style={{ color: '#5A9178' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>FAISS RAG Indexed</span>
          </div>
        </motion.div>

        {/* KPI 4: Team Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="glass-card p-4 rounded-xl relative overflow-hidden group cursor-pointer hover-glow-rose"
          style={{ border: '1px solid rgba(192,80,74,0.2)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #C0504A, #E88080)' }} />
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-obsidian-text-muted uppercase tracking-wider">Team Users</span>
            <div className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(192,80,74,0.1)', border: '1px solid rgba(192,80,74,0.25)', color: '#C0504A' }}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <span className="text-2xl font-black tracking-tight text-gradient-rose">
                {stats?.total_users || 0}
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] font-semibold" style={{ color: '#C0504A' }}>Role-Based Security Active</div>
        </motion.div>

        {/* KPI 5: Procurement Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-4 rounded-xl relative overflow-hidden group cursor-pointer hover-glow-sage"
          style={{ border: '1px solid rgba(74,138,106,0.2)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #4A8A6A, #00C9A7)' }} />
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-obsidian-text-muted uppercase tracking-wider">Procurement Health</span>
            <div className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: 'rgba(74,138,106,0.12)', border: '1px solid rgba(74,138,106,0.25)', color: '#4A8A6A' }}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className="text-2xl font-black tracking-tight text-gradient-sage">94.2%</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 ml-1.5">OPTIMAL</span>
          </div>
          <div className="mt-2 text-[11px] font-semibold" style={{ color: '#4A8A6A' }}>High Vendor Alignment</div>
        </motion.div>
      </div>

      {/* 3. AI Narrative Banner */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="p-5 rounded-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(74,138,106,0.12), rgba(125,175,149,0.08), rgba(203,216,210,0.15))',
          border: '1px solid rgba(74,138,106,0.3)',
          boxShadow: '0 4px 20px rgba(74,138,106,0.1)'
        }}
      >
        {/* Animated shimmer bar */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #4A8A6A, #CBD8D2, #C9964A, #4A8A6A)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }}
        />
        <div className="flex items-start space-x-4">
          <div
            className="p-3 rounded-xl flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(74,138,106,0.15)', border: '1px solid rgba(74,138,106,0.3)', color: '#4A8A6A' }}
          >
            <Zap className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-obsidian-text-primary">
                Gemini AI Executive Narrative & Today's Insights
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(74,138,106,0.2)', color: '#2D6B4A', border: '1px solid rgba(74,138,106,0.35)' }}
              >
                LIVE INSIGHT
              </span>
            </div>
            <p className="text-xs text-obsidian-text-secondary mt-1 leading-relaxed">
              "Cross-project analysis indicates <strong style={{ color: '#2D6B4A' }}>$44.0 Billion</strong> in total budget across 9 active EPC contracts.
              Key specs from <em>al_zour_spec.pdf</em> have been parsed into structured BOQ line items.
              Recommended priority: Review transformer warranty terms on NEOM Phase 1 before releasing the final PO milestone."
            </p>
          </div>
        </div>
      </motion.div>

      {/* 4. Main Charts Section Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Budget Trend */}
        <div className="glass-card p-5 rounded-xl border lg:col-span-2" style={{ border: '1px solid rgba(196,212,201,0.6)' }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-obsidian-text-primary">Budget Allocation vs Actual Spend ($B)</h3>
              <p className="text-xs text-obsidian-text-muted">6-month cumulative EPC capital expenditure tracking</p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(74,138,106,0.15)', color: '#2D6B4A', border: '1px solid rgba(74,138,106,0.3)' }}>+18.5% YOY</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={budgetTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="budgetColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A8A6A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4A8A6A" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="spendColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9964A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#C9964A" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#C4D4C9" opacity={0.5} />
                <XAxis dataKey="month" stroke="#7A9B89" fontSize={11} tickLine={false} />
                <YAxis stroke="#7A9B89" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#F5F8F5', borderColor: '#C4D4C9', borderRadius: '12px', fontSize: '12px', color: '#1C2E22' }}
                />
                <Area type="monotone" dataKey="budget" name="Allocated Budget ($B)" stroke="#4A8A6A" fillOpacity={1} fill="url(#budgetColor)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="spend" name="Actual Spend ($B)" stroke="#C9964A" fillOpacity={1} fill="url(#spendColor)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Project Status */}
        <div className="glass-card p-5 rounded-xl border" style={{ border: '1px solid rgba(196,212,201,0.6)' }}>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-obsidian-text-primary">Project Status Breakdown</h3>
            <p className="text-xs text-obsidian-text-muted">Distribution of active vs completed EPC nodes</p>
          </div>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectStatusData} innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#F5F8F5', borderColor: '#C4D4C9', borderRadius: '12px', fontSize: '12px', color: '#1C2E22' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center space-x-5 pt-3" style={{ borderTop: '1px solid rgba(196,212,201,0.6)' }}>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#4A8A6A' }}></span>
              <span className="text-xs text-obsidian-text-secondary">In Progress ({stats?.active_projects || 0})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#7DAF95' }}></span>
              <span className="text-xs text-obsidian-text-secondary">Completed ({stats?.completed_projects || 0})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Additional Charts: Vendor Scores & Risk Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Vendor Evaluation */}
        <div className="glass-card p-5 rounded-xl border" style={{ border: '1px solid rgba(196,212,201,0.6)' }}>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-obsidian-text-primary">Top Vendor Multi-Factor Evaluation</h3>
            <p className="text-xs text-obsidian-text-muted">Technical match, commercial competitiveness, & compliance score</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorScoresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#C4D4C9" opacity={0.5} />
                <XAxis dataKey="name" stroke="#7A9B89" fontSize={10} tickLine={false} />
                <YAxis stroke="#7A9B89" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#F5F8F5', borderColor: '#C4D4C9', borderRadius: '12px', fontSize: '12px', color: '#1C2E22' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#4A6355' }} />
                <Bar dataKey="technical" name="Technical Score" fill="#4A8A6A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compliance" name="Spec Compliance %" fill="#CBD8D2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="commercial" name="Commercial Score" fill="#C9964A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Milestone Progress */}
        <div className="glass-card p-5 rounded-xl border" style={{ border: '1px solid rgba(196,212,201,0.6)' }}>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-obsidian-text-primary">Key EPC Milestones Progress (%)</h3>
            <p className="text-xs text-obsidian-text-muted">Current Gantt completion across primary contracts</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={timelineProgressData} margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4A8A6A" />
                    <stop offset="100%" stopColor="#7DAF95" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#C4D4C9" opacity={0.5} />
                <XAxis type="number" stroke="#7A9B89" fontSize={11} domain={[0, 100]} />
                <YAxis type="category" dataKey="name" stroke="#7A9B89" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#F5F8F5', borderColor: '#C4D4C9', borderRadius: '12px', fontSize: '12px', color: '#1C2E22' }}
                />
                <Bar dataKey="progress" name="Progress (%)" fill="url(#progressGrad)" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts */}
        <div className="glass-card p-5 rounded-xl space-y-4 hover-glow-rose" style={{ border: '1px solid rgba(192,80,74,0.2)' }}>
          <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(196,212,201,0.5)' }}>
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-4 h-4" style={{ color: '#C0504A' }} />
              <h3 className="text-sm font-bold text-obsidian-text-primary">Critical Procurement Alerts</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(192,80,74,0.12)', color: '#C0504A', border: '1px solid rgba(192,80,74,0.3)' }}>
              2 ACTION REQUIRED
            </span>
          </div>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-xl transition-all hover:bg-[rgba(192,80,74,0.06)]" style={{ background: 'rgba(192,80,74,0.04)', border: '1px solid rgba(192,80,74,0.15)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(192,80,74,0.15)', color: '#C0504A', border: '1px solid rgba(192,80,74,0.3)' }}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-obsidian-text-muted">{alert.project}</span>
                </div>
                <h4 className="text-xs font-semibold text-obsidian-text-primary mt-2">{alert.title}</h4>
                <p className="text-[11px] text-obsidian-text-secondary mt-1">{alert.impact}</p>
                <div className="mt-2 pt-2 text-[10px] flex items-center space-x-1" style={{ borderTop: '1px solid rgba(196,212,201,0.4)', color: '#C9964A' }}>
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Recommendation: {alert.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-card p-5 rounded-xl space-y-4 hover-glow-sage" style={{ border: '1px solid rgba(74,138,106,0.2)' }}>
          <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(196,212,201,0.5)' }}>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" style={{ color: '#4A8A6A' }} />
              <h3 className="text-sm font-bold text-obsidian-text-primary">Recent Platform Activity</h3>
            </div>
            <span className="text-[10px] font-bold" style={{ color: '#5A9178' }}>LIVE FEED</span>
          </div>
          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start space-x-3 p-2.5 rounded-xl transition-all hover:bg-[rgba(90,145,120,0.08)]" style={{ background: 'rgba(90,145,120,0.04)', border: '1px solid rgba(196,212,201,0.5)' }}>
                <div className="p-2 rounded-xl mt-0.5" style={{ background: 'rgba(74,138,106,0.1)', border: '1px solid rgba(74,138,106,0.25)', color: '#4A8A6A' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-semibold text-obsidian-text-primary truncate">{act.title}</h4>
                    <span className="text-[10px] text-obsidian-text-muted">{act.time}</span>
                  </div>
                  <p className="text-[11px] text-obsidian-text-secondary mt-0.5 line-clamp-2">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Savings */}
        <div className="glass-card p-5 rounded-xl space-y-4 hover-glow-amber" style={{ border: '1px solid rgba(201,150,74,0.2)' }}>
          <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid rgba(196,212,201,0.5)' }}>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" style={{ color: '#C9964A' }} />
              <h3 className="text-sm font-bold text-obsidian-text-primary">Executive AI Savings</h3>
            </div>
            <span className="text-[10px] font-bold" style={{ color: '#C9964A' }}>+$3.2M SAVINGS</span>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl transition-all hover:bg-[rgba(74,138,106,0.08)]" style={{ background: 'linear-gradient(135deg, rgba(74,138,106,0.08), rgba(125,175,149,0.05))', border: '1px solid rgba(74,138,106,0.25)' }}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold" style={{ color: '#2D6B4A' }}>COMMERCIAL OPTIMIZATION</span>
                <span className="text-xs font-black" style={{ color: '#4A8A6A' }}>+$1.8M</span>
              </div>
              <h4 className="text-xs font-semibold text-obsidian-text-primary mt-1.5">Consolidate Turbine POs</h4>
              <p className="text-[11px] text-obsidian-text-secondary mt-1">
                Combining Siemens Energy orders across Al Zour & NEOM projects qualifies for bulk 4.2% discount.
              </p>
            </div>
            <div className="p-3.5 rounded-xl transition-all hover:bg-[rgba(201,150,74,0.08)]" style={{ background: 'linear-gradient(135deg, rgba(201,150,74,0.08), rgba(232,192,128,0.05))', border: '1px solid rgba(201,150,74,0.25)' }}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold" style={{ color: '#9B6A20' }}>RISK MITIGATION</span>
                <span className="text-xs font-black" style={{ color: '#C9964A' }}>+$1.4M</span>
              </div>
              <h4 className="text-xs font-semibold text-obsidian-text-primary mt-1.5">Enforce Pre-shipment Testing</h4>
              <p className="text-[11px] text-obsidian-text-secondary mt-1">
                Mandate factory acceptance testing on 50 Cooling Towers to prevent site delays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
