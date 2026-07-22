export type DocumentStatus = 'UPLOADED' | 'EXTRACTING' | 'EXTRACTED' | 'PARSED' | 'FAILED';

export interface DocumentItem {
  id: string;
  filename: string;
  content_type: string;
  file_size: number;
  file_path?: string;
  extracted_text?: string;
  metadata_json?: Record<string, any>;
  status: DocumentStatus;
  error_message?: string;
  project_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentParseResponse {
  id: string;
  status: string;
  extracted_text: string;
  metadata_json: Record<string, any>;
}
