import React, { useState } from 'react';
import { X, FileText, Sparkles, Copy, Check, Cpu, CheckCircle2 } from 'lucide-react';
import { DocumentItem } from '../../types/document';

interface DocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentItem | null;
  projectName?: string;
  onParse?: (doc: DocumentItem) => void;
  isParsing?: boolean;
}

const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  isOpen,
  onClose,
  document,
  projectName,
  onParse,
  isParsing,
}) => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'raw_text' | 'pipeline'>('metadata');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const handleCopyText = () => {
    if (document.extracted_text) {
      navigator.clipboard.writeText(document.extracted_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-card w-full max-w-3xl rounded-obsidian border border-obsidian-border shadow-glass overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-obsidian-border flex justify-between items-center bg-obsidian-surface/80">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-obsidian bg-obsidian-card border border-obsidian-ai/30 text-obsidian-ai">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-obsidian-text-primary flex items-center space-x-2">
                <span>{document.filename}</span>
                {document.status === 'PARSED' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-ai/20 text-obsidian-ai border border-obsidian-ai/30 font-semibold">
                    GEMINI PARSED
                  </span>
                )}
              </h3>
              <p className="text-xs text-obsidian-text-muted mt-0.5">
                Linked to: <strong className="text-obsidian-emerald">{projectName || 'Unassigned'}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-obsidian-text-muted hover:text-obsidian-text-primary rounded-obsidian hover:bg-obsidian-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 border-b border-obsidian-border bg-obsidian-bg/40 flex items-center space-x-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'metadata'
                ? 'border-obsidian-ai text-obsidian-ai'
                : 'border-transparent text-obsidian-text-secondary hover:text-obsidian-text-primary'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Structured AI Metadata</span>
          </button>

          <button
            onClick={() => setActiveTab('raw_text')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'raw_text'
                ? 'border-obsidian-emerald text-obsidian-emerald'
                : 'border-transparent text-obsidian-text-secondary hover:text-obsidian-text-primary'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Extracted Raw Text</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`py-3 border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'pipeline'
                ? 'border-obsidian-gold text-obsidian-gold'
                : 'border-transparent text-obsidian-text-secondary hover:text-obsidian-text-primary'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>AI Pipeline Stepper</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Structured AI Metadata */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              {document.metadata_json && Object.keys(document.metadata_json).length > 0 ? (
                <div className="glass-panel p-4 rounded-obsidian border border-obsidian-border/80 space-y-4 font-mono text-xs">
                  <div className="flex justify-between items-center border-b border-obsidian-border/60 pb-2">
                    <span className="text-[11px] text-obsidian-ai font-bold">GEMINI 1.5 EXTRACTED JSON SCHEMAS</span>
                    <span className="text-[10px] text-obsidian-text-muted">FAISS Vector Grounded</span>
                  </div>

                  <pre className="p-3 bg-obsidian-bg rounded-obsidian text-obsidian-emerald overflow-x-auto text-[11px] leading-relaxed">
                    {JSON.stringify(document.metadata_json, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 glass-panel rounded-obsidian border border-obsidian-border space-y-3">
                  <Sparkles className="w-8 h-8 text-obsidian-text-muted mx-auto" />
                  <p className="text-xs text-obsidian-text-secondary">No AI structured metadata parsed yet.</p>
                  {onParse && (
                    <button
                      onClick={() => onParse(document)}
                      disabled={isParsing}
                      className="px-4 py-2 text-xs font-semibold bg-obsidian-ai text-obsidian-bg rounded-obsidian shadow-ai-glow hover:opacity-90 transition-all inline-flex items-center space-x-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isParsing ? 'Parsing Gemini...' : 'Run Gemini AI Parser'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Extracted Raw Text */}
          {activeTab === 'raw_text' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-obsidian-text-secondary">PDF Text Extraction Result</span>
                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 rounded-obsidian text-xs font-medium bg-obsidian-surface border border-obsidian-border text-obsidian-text-primary hover:bg-obsidian-card transition-colors flex items-center space-x-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-obsidian-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              <div className="p-4 bg-obsidian-bg rounded-obsidian border border-obsidian-border max-h-96 overflow-y-auto font-mono text-xs text-obsidian-text-secondary whitespace-pre-wrap leading-relaxed">
                {document.extracted_text || 'No text extracted from document.'}
              </div>
            </div>
          )}

          {/* TAB 3: AI Pipeline Stepper */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6 py-4">
              <h4 className="text-xs font-bold text-obsidian-text-primary uppercase tracking-wider">
                Document AI Ingestion Pipeline
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Step 1: Upload */}
                <div className="p-4 rounded-obsidian bg-obsidian-card border border-obsidian-emerald/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-obsidian-emerald font-bold">STEP 1</span>
                    <CheckCircle2 className="w-4 h-4 text-obsidian-emerald" />
                  </div>
                  <h5 className="text-xs font-bold text-obsidian-text-primary">PDF Upload</h5>
                  <p className="text-[10px] text-obsidian-text-muted">Uploaded & stored in local memory repository.</p>
                </div>

                {/* Step 2: Extraction */}
                <div className={`p-4 rounded-obsidian bg-obsidian-card border space-y-2 ${
                  document.extracted_text ? 'border-obsidian-emerald/40' : 'border-obsidian-border'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-obsidian-emerald font-bold">STEP 2</span>
                    <CheckCircle2 className={`w-4 h-4 ${document.extracted_text ? 'text-obsidian-emerald' : 'text-obsidian-text-muted'}`} />
                  </div>
                  <h5 className="text-xs font-bold text-obsidian-text-primary">Text Extraction</h5>
                  <p className="text-[10px] text-obsidian-text-muted">PyMuPDF / pdfplumber raw text parsed.</p>
                </div>

                {/* Step 3: AI Gemini */}
                <div className={`p-4 rounded-obsidian bg-obsidian-card border space-y-2 ${
                  document.status === 'PARSED' ? 'border-obsidian-ai/40' : 'border-obsidian-border'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-obsidian-ai font-bold">STEP 3</span>
                    <Sparkles className={`w-4 h-4 ${document.status === 'PARSED' ? 'text-obsidian-ai animate-pulse' : 'text-obsidian-text-muted'}`} />
                  </div>
                  <h5 className="text-xs font-bold text-obsidian-text-primary">Gemini LLM</h5>
                  <p className="text-[10px] text-obsidian-text-muted">Structured BOQ & spec extraction.</p>
                </div>

                {/* Step 4: FAISS Vector Index */}
                <div className={`p-4 rounded-obsidian bg-obsidian-card border space-y-2 ${
                  document.status === 'PARSED' ? 'border-obsidian-gold/40' : 'border-obsidian-border'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-obsidian-gold font-bold">STEP 4</span>
                    <CheckCircle2 className={`w-4 h-4 ${document.status === 'PARSED' ? 'text-obsidian-gold' : 'text-obsidian-text-muted'}`} />
                  </div>
                  <h5 className="text-xs font-bold text-obsidian-text-primary">Vector Indexing</h5>
                  <p className="text-[10px] text-obsidian-text-muted">Embedded in 384-dim FAISS index.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsModal;
