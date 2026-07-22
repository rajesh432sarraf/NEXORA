export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ApiError {
  detail: string | Array<{ msg: string; loc: string[] }>;
  status?: number;
}
