export interface SearchMatch {
  document_id: string;
  filename: string;
  snippet: string;
  score: number;
  page_number?: number;
  metadata?: Record<string, any>;
}

export interface SearchResponse {
  query: string;
  project_id?: string;
  answer: string;
  matches: SearchMatch[];
  confidence_score?: number;
}

export interface CopilotCitation {
  document_id: string;
  filename: string;
  page_number?: number;
  confidence: number;
  snippet: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: CopilotCitation[];
  confidence_score?: number;
}

export interface CopilotConversation {
  id: string;
  title: string;
  project_id?: string;
  messages: CopilotMessage[];
  updated_at: string;
}
