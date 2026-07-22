// RFQ Types
export type RFQStatus = 'DRAFT' | 'ISSUED' | 'EVALUATING' | 'AWARDED' | 'CLOSED';

export interface RFQItem {
  id: string;
  rfq_number: string;
  title: string;
  project_id: string;
  budget: number;
  status: RFQStatus;
  due_date: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RFQCreateInput {
  rfq_number: string;
  title: string;
  project_id: string;
  budget: number;
  status: RFQStatus;
  due_date: string;
  description?: string;
}

// Purchase Order Types
export type POStatus = 'DRAFT' | 'ISSUED' | 'IN_TRANSIT' | 'FULFILLED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  po_number: string;
  project_id: string;
  vendor_name: string;
  total_amount: number;
  status: POStatus;
  issued_date: string;
  delivery_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface POCreateInput {
  po_number: string;
  project_id: string;
  vendor_name: string;
  total_amount: number;
  status: POStatus;
  issued_date: string;
  delivery_date?: string;
  notes?: string;
}

// Procurement Item Types
export type ProcurementStatus = 'PENDING' | 'ORDERED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface ProcurementLineItem {
  id: string;
  item_name: string;
  project_id: string;
  quantity: number;
  unit: string;
  estimated_cost: number;
  actual_cost?: number;
  status: ProcurementStatus;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProcurementItemCreateInput {
  item_name: string;
  project_id: string;
  quantity: number;
  unit: string;
  estimated_cost: number;
  actual_cost?: number;
  status: ProcurementStatus;
  notes?: string;
}
