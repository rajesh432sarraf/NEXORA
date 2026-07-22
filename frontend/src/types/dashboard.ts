export interface DashboardStats {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_budget: number;
  total_documents: number;
  total_users: number;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  type: 'UPLOAD' | 'PARSED' | 'COMPLIANCE' | 'PO_ISSUED' | 'RISK_FLAG';
  title: string;
  description: string;
  badge: string;
}

export interface CriticalAlert {
  id: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  title: string;
  project: string;
  timestamp: string;
  impact: string;
}

export interface ExecutiveRecommendation {
  id: string;
  action: string;
  category: string;
  estimatedSaving: string;
  priority: 'HIGH' | 'URGENT' | 'NORMAL';
}
