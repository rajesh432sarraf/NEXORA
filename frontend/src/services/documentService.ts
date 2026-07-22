import apiClient from './api';
import { DocumentItem, DocumentParseResponse } from '../types/document';

export const documentService = {
  // Get all uploaded documents (optionally filtered by project_id)
  getDocuments: async (projectId?: string): Promise<DocumentItem[]> => {
    const params = projectId && projectId !== 'ALL' ? { project_id: projectId } : {};
    const response = await apiClient.get<DocumentItem[]>('/documents', { params });
    return response.data;
  },

  // Get single document details
  getDocumentById: async (id: string): Promise<DocumentItem> => {
    const response = await apiClient.get<DocumentItem>(`/documents/${id}`);
    return response.data;
  },

  // Upload document PDF file with optional project association
  uploadDocument: async (
    file: File,
    projectId?: string,
    onUploadProgress?: (progress: number) => void
  ): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId && projectId !== 'ALL') {
      formData.append('project_id', projectId);
    }

    const response = await apiClient.post<DocumentItem>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (onUploadProgress) {
            onUploadProgress(percentCompleted);
          }
        }
      },
    });
    return response.data;
  },

  // Trigger Gemini AI parsing on an extracted document
  parseDocument: async (id: string): Promise<DocumentParseResponse> => {
    const response = await apiClient.post<DocumentParseResponse>(`/documents/${id}/parse`);
    return response.data;
  },
};
