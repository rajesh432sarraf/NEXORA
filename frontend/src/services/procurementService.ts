import apiClient from './api';
import {
  RFQItem,
  RFQCreateInput,
  PurchaseOrderItem,
  POCreateInput,
  ProcurementLineItem,
  ProcurementItemCreateInput,
} from '../types/procurement';

export const procurementService = {
  // --- RFQs ---
  getRFQs: async (projectId?: string): Promise<RFQItem[]> => {
    const params = projectId && projectId !== 'ALL' ? { project_id: projectId } : {};
    const response = await apiClient.get<RFQItem[]>('/rfqs', { params });
    return response.data;
  },

  createRFQ: async (data: RFQCreateInput): Promise<RFQItem> => {
    const response = await apiClient.post<RFQItem>('/rfqs', data);
    return response.data;
  },

  // --- Purchase Orders ---
  getPurchaseOrders: async (projectId?: string): Promise<PurchaseOrderItem[]> => {
    const params = projectId && projectId !== 'ALL' ? { project_id: projectId } : {};
    const response = await apiClient.get<PurchaseOrderItem[]>('/purchase-orders', { params });
    return response.data;
  },

  createPurchaseOrder: async (data: POCreateInput): Promise<PurchaseOrderItem> => {
    const response = await apiClient.post<PurchaseOrderItem>('/purchase-orders', data);
    return response.data;
  },

  // --- Procurement Items ---
  getProcurementItems: async (projectId?: string): Promise<ProcurementLineItem[]> => {
    const params = projectId && projectId !== 'ALL' ? { project_id: projectId } : {};
    const response = await apiClient.get<ProcurementLineItem[]>('/procurement', { params });
    return response.data;
  },

  createProcurementItem: async (data: ProcurementItemCreateInput): Promise<ProcurementLineItem> => {
    const response = await apiClient.post<ProcurementLineItem>('/procurement', data);
    return response.data;
  },
};
