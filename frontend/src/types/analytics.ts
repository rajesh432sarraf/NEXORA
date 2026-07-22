// Timeline Milestone Types
export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface MilestoneItem {
  id: string;
  title: string;
  project_id: string;
  start_date: string;
  end_date: string;
  progress_percentage: number;
  status: MilestoneStatus;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MilestoneCreateInput {
  title: string;
  project_id: string;
  start_date: string;
  end_date: string;
  progress_percentage: number;
  status: MilestoneStatus;
  description?: string;
}

// Compliance Matrix Types
export interface ComplianceMatchItem {
  item: string;
  details?: string;
  spec_value?: string;
  vendor_value?: string;
}

export interface ComplianceReport {
  overall_score: number;
  status: 'Compliant' | 'Non-Compliant' | 'Partially-Compliant';
  spec_document_id: string;
  vendor_document_id: string;
  full_matches: ComplianceMatchItem[];
  missing_requirements: ComplianceMatchItem[];
  partial_matches: ComplianceMatchItem[];
  recommendations: string[];
}

// Vendor Evaluation Types
export interface VendorRank {
  rank: number;
  vendor_name: string;
  overall_score: number;
  technical_score: number;
  commercial_score: number;
  risk_score: number;
  delivery_weeks?: number;
  strengths: string[];
  weaknesses: string[];
}

export interface EvaluationReport {
  recommended_vendor: string;
  procurement_summary: string;
  rankings: VendorRank[];
}

// Risk Engine Types
export interface SubRiskScore {
  category: string;
  score: number;
  level: 'Low' | 'Medium' | 'High';
}

export interface RiskReport {
  overall_risk_score: number;
  overall_risk_level: 'Low' | 'Medium' | 'High';
  delivery_risk: number;
  technical_risk: number;
  commercial_risk: number;
  compliance_risk: number;
  identified_risks: string[];
  mitigations: string[];
  executive_summary: string;
}

// Executive Insights Types
export interface ExecutiveKpis {
  total_vendors_evaluated: number;
  average_compliance_score: number;
  average_delivery_timeline_weeks: number;
  number_of_high_risk_vendors: number;
}

export interface ExecutiveInsightsReport {
  overall_procurement_health: string;
  overall_score: number;
  overall_risk_level: string;
  top_vendor: string;
  kpis: ExecutiveKpis;
  executive_summary: string;
  critical_risks: string[];
  recommended_actions: string[];
}
