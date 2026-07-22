import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, FolderKanban, Eye, Cpu } from 'lucide-react';
import { DocumentItem, DocumentStatus } from '../../types/document';

interface DocumentCardProps {
  document: DocumentItem;
  projectName?: string;
  onViewDetails: (document: DocumentItem) => void;
  onParse: (document: DocumentItem) => void;
  isParsing?: boolean;
}

const statusBadges: Record<DocumentStatus, { label: string; style: string }> = {
  UPLOADED: { label: 'Uploaded', style: 'bg-obsidian-copper/20 text-obsidian-copper border-obsidian-copper/40' },
  EXTRACTING: { label: 'Extracting...', style: 'bg-obsidian-warning/20 text-obsidian-warning border-obsidian-warning/40 animate-pulse' },
  EXTRACTED: { label: 'Extracted', style: 'bg-obsidian-emerald/20 text-obsidian-emerald border-obsidian-emerald/40' },
  PARSED: { label: 'Gemini Parsed', style: 'bg-obsidian-ai/20 text-obsidian-ai border-obsidian-ai/40 shadow-ai-glow' },
  FAILED: { label: 'Failed', style: 'bg-obsidian-danger/20 text-obsidian-danger border-obsidian-danger/40' },
};

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  projectName,
  onViewDetails,
  onParse,
  isParsing,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`;
    if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="glass-card p-5 rounded-obsidian border border-obsidian-border hover:border-obsidian-ai/40 transition-all flex flex-col justify-between group relative overflow-hidden"
    >
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="p-2.5 rounded-obsidian bg-obsidian-surface border border-obsidian-border text-obsidian-emerald group-hover:border-obsidian-emerald/40 transition-colors">
            <FileText className="w-5 h-5" />
          </div>

          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
              statusBadges[document.status]?.style || statusBadges.UPLOADED.style
            }`}
          >
            {statusBadges[document.status]?.label || document.status}
          </span>
        </div>

        {/* Title & Metadata */}
        <div className="mt-3">
          <h3
            onClick={() => onViewDetails(document)}
            className="text-sm font-bold text-obsidian-text-primary tracking-tight truncate cursor-pointer hover:text-obsidian-ai transition-colors"
            title={document.filename}
          >
            {document.filename}
          </h3>

          <div className="mt-2 space-y-1 text-xs text-obsidian-text-secondary">
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="font-mono text-obsidian-text-muted">{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span className="uppercase text-obsidian-text-muted">{document.content_type?.split('/')[1] || 'PDF'}</span>
            </div>

            {projectName && (
              <div className="flex items-center space-x-1.5 text-obsidian-emerald text-[11px] font-medium pt-1">
                <FolderKanban className="w-3.5 h-3.5" />
                <span className="truncate">{projectName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions & Parse Button */}
      <div className="mt-5 pt-4 border-t border-obsidian-border/60 flex items-center justify-between">
        <button
          onClick={() => onViewDetails(document)}
          className="px-3 py-1.5 rounded-obsidian text-xs font-semibold text-obsidian-text-secondary hover:text-obsidian-text-primary hover:bg-obsidian-card border border-obsidian-border transition-colors flex items-center space-x-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>

        {document.status !== 'PARSED' ? (
          <button
            onClick={() => onParse(document)}
            disabled={isParsing}
            className="px-3 py-1.5 rounded-obsidian text-xs font-semibold bg-obsidian-ai/10 hover:bg-obsidian-ai/20 text-obsidian-ai border border-obsidian-ai/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isParsing ? 'animate-spin' : ''}`} />
            <span>{isParsing ? 'Parsing...' : 'Parse Gemini'}</span>
          </button>
        ) : (
          <span className="text-[11px] font-mono text-obsidian-ai font-semibold flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Ready</span>
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentCard;
