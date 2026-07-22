import apiClient from './api';
import {
  MilestoneItem,
  MilestoneCreateInput,
  ComplianceReport,
  EvaluationReport,
  RiskReport,
  ExecutiveInsightsReport,
} from '../types/analytics';

export const analyticsService = {
  // --- Timeline ---
  getMilestones: async (projectId?: string): Promise<MilestoneItem[]> => {
    const params = projectId && projectId !== 'ALL' ? { project_id: projectId } : {};
    const response = await apiClient.get<MilestoneItem[]>('/timeline', { params });
    return response.data;
  },

  createMilestone: async (data: MilestoneCreateInput): Promise<MilestoneItem> => {
    const response = await apiClient.post<MilestoneItem>('/timeline', data);
    return response.data;
  },

  // --- Compliance Matrix ---
  compareCompliance: async (
    specDocId: string,
    vendorDocId: string
  ): Promise<ComplianceReport> => {
    const response = await apiClient.post<ComplianceReport>('/compliance/compare', {
      spec_document_id: specDocId,
      vendor_document_id: vendorDocId,
    });
    return response.data;
  },

  // --- Vendor Evaluation ---
  evaluateVendors: async (
    rfqId: string,
    proposalDocIds: string[]
  ): Promise<EvaluationReport> => {
    const response = await apiClient.post<EvaluationReport>('/vendor-evaluation/evaluate', {
      rfq_id: rfqId,
      proposal_document_ids: proposalDocIds,
    });
    return response.data;
  },

  // --- Risk Intelligence Engine ---
  predictRisk: async (
    projectId: string,
    rfqId?: string,
    vendorDocId?: string
  ): Promise<RiskReport> => {
    const response = await apiClient.post<RiskReport>('/risk/predict', {
      project_id: projectId,
      rfq_id: rfqId,
      vendor_document_id: vendorDocId,
    });
    return response.data;
  },

  // --- Executive Insights ---
  generateInsights: async (
    projectId: string,
    rfqId?: string
  ): Promise<ExecutiveInsightsReport> => {
    const response = await apiClient.post<ExecutiveInsightsReport>('/executive-insights/generate', {
      project_id: projectId,
      rfq_id: rfqId,
    });
    return response.data;
  },
};
