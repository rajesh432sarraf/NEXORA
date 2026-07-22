export type ProjectStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'PLANNING';

export interface Project {
  id: string;
  project_name: string;
  client_name: string;
  location: string;
  project_type: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  description?: string;
  created_at?: string;
  updated_at?: string;
  // Computed fields for UI
  progress_percentage?: number;
  health_status?: 'OPTIMAL' | 'AT_RISK' | 'CRITICAL';
}

export interface ProjectCreateInput {
  project_name: string;
  client_name: string;
  location: string;
  project_type: string;
  budget: number;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  description?: string;
}

export interface ProjectUpdateInput {
  project_name?: string;
  client_name?: string;
  location?: string;
  project_type?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  status?: ProjectStatus;
  description?: string;
}
