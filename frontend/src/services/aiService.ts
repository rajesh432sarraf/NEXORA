import apiClient from './api';
import { SearchResponse, CopilotMessage } from '../types/ai';

export const aiService = {
  // Vector RAG Search
  searchVector: async (query: string, projectId?: string, topK: number = 5): Promise<SearchResponse> => {
    const payload: any = { query, top_k: topK };
    if (projectId && projectId !== 'ALL') {
      payload.project_id = projectId;
    }

    const response = await apiClient.post<SearchResponse>('/search', payload);
    return response.data;
  },

  // Copilot Chat Conversation Endpoint
  chatCopilot: async (
    message: string,
    conversationId?: string,
    projectId?: string
  ): Promise<{ response: string; citations?: any[]; confidence_score?: number; conversation_id?: string }> => {
    const payload: any = { message };
    if (conversationId) payload.conversation_id = conversationId;
    if (projectId && projectId !== 'ALL') payload.project_id = projectId;

    const res = await apiClient.post('/copilot/chat', payload);
    return res.data;
  },
};
