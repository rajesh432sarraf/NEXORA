import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  FolderKanban,
  CheckCircle2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { documentService } from '../../services/documentService';
import { projectService } from '../../services/projectService';
import { DocumentItem } from '../../types/document';
import DocumentCard from './DocumentCard';
import DocumentDetailsModal from './DocumentDetailsModal';
import Skeleton from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const DocumentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Doc Modal State
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [parsingDocId, setParsingDocId] = useState<string | null>(null);

  // Fetch Documents
  const { data: documents = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['documents', selectedProjectId],
    queryFn: () => documentService.getDocuments(selectedProjectId),
  });

  // Fetch Projects for Selector
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, projectId }: { file: File; projectId?: string }) =>
      documentService.uploadDocument(file, projectId, (percent) => setUploadProgress(percent)),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setUploadProgress(null);
      success('File Uploaded & Extracted', `"${newDoc.filename}" has been stored safely.`);
    },
    onError: (err: any) => {
      setUploadProgress(null);
      showError('Upload Failed', err.response?.data?.detail || 'Could not upload PDF file.');
    },
  });

  // Parse Mutation
  const parseMutation = useMutation({
    mutationFn: (id: string) => documentService.parseDocument(id),
    onSuccess: (parseRes, id) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setParsingDocId(null);
      success('Gemini AI Parsing Complete', 'Structured BOQ specifications extracted.');
      // If modal is open for this doc, update it
      if (selectedDoc && selectedDoc.id === id) {
        setSelectedDoc((prev) =>
          prev
            ? {
                ...prev,
                status: 'PARSED',
                extracted_text: parseRes.extracted_text,
                metadata_json: parseRes.metadata_json,
              }
            : null
        );
      }
    },
    onError: (err: any) => {
      setParsingDocId(null);
      showError('Parsing Failed', err.response?.data?.detail || 'Failed to parse document with Gemini.');
    },
  });

  // File Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        uploadMutation.mutate({ file, projectId: selectedProjectId });
      } else {
        showError('Invalid File Type', 'Please upload PDF specification documents only.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      uploadMutation.mutate({ file, projectId: selectedProjectId });
    }
  };

  const handleTriggerParse = (doc: DocumentItem) => {
    setParsingDocId(doc.id);
    parseMutation.mutate(doc.id);
  };

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((d) => {
      const matchesSearch = d.filename.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  const projectsMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((p) => map.set(p.id, p.project_name));
    return map;
  }, [projects]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-ai uppercase">
            DOCUMENT INTELLIGENCE & RAG
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            EPC Specification Parser
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Upload EPC PDFs, run Gemini AI structural extraction, and index vectors for RAG search.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-obsidian bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-secondary hover:text-obsidian-text-primary transition-all flex items-center space-x-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin text-obsidian-ai' : ''}`} />
            <span className="hidden sm:inline">Refresh Specs</span>
          </button>
        </div>
      </div>

      {/* 2. AI Processing Pipeline Stepper Banner */}
      <div className="glass-panel p-4 rounded-obsidian border border-obsidian-ai/30 shadow-ai-glow">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-obsidian bg-obsidian-ai/10 border border-obsidian-ai/30 text-obsidian-ai">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-obsidian-text-primary">AI Document Ingestion Pipeline</h3>
              <p className="text-[11px] text-obsidian-text-muted">Automated PDF processing workflow</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="flex items-center space-x-1 text-obsidian-emerald font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1. PDF Upload</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-obsidian-text-muted" />
            <div className="flex items-center space-x-1 text-obsidian-emerald font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. Extraction</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-obsidian-text-muted" />
            <div className="flex items-center space-x-1 text-obsidian-ai font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>3. Gemini Parsing</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-obsidian-text-muted" />
            <div className="flex items-center space-x-1 text-obsidian-gold font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>4. RAG Indexing</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Large Drag & Drop Uploader Area */}
      <div className="glass-card p-6 md:p-8 rounded-obsidian border border-obsidian-border space-y-4">
        {/* Project Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-obsidian-border/60">
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-obsidian-emerald" />
            <span className="text-xs font-semibold text-obsidian-text-primary">Link Upload to Project:</span>
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3.5 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border max-w-xs"
          >
            <option value="ALL">Unassigned (Global Library)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.project_name} ({p.client_name})
              </option>
            ))}
          </select>
        </div>

        {/* Dropzone Container */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-obsidian p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-obsidian-ai bg-obsidian-ai/10 shadow-ai-glow scale-[0.99]'
              : 'border-obsidian-border hover:border-obsidian-ai/50 bg-obsidian-surface/40 hover:bg-obsidian-surface/60'
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-file-upload"
          />
          <label htmlFor="pdf-file-upload" className="cursor-pointer block space-y-3">
            <div className="w-14 h-14 rounded-full bg-obsidian-card border border-obsidian-border flex items-center justify-center mx-auto text-obsidian-ai shadow-ai-glow group-hover:scale-110 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-obsidian-text-primary">
                Drag & Drop PDF Specifications Here
              </h3>
              <p className="text-xs text-obsidian-text-muted mt-1">
                Supports technical specs, RFQ proposals, BOQ equipment lists (PDF up to 50MB)
              </p>
            </div>

            <span className="inline-block px-4 py-2 bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-primary text-xs font-semibold rounded-obsidian transition-colors">
              Browse Files
            </span>
          </label>
        </div>

        {/* Upload Progress Bar */}
        {(uploadProgress !== null || uploadMutation.isPending) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-obsidian bg-obsidian-surface border border-obsidian-ai/30 space-y-2"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-obsidian-text-primary flex items-center space-x-2">
                <FileText className="w-4 h-4 text-obsidian-ai animate-bounce" />
                <span>Uploading and extracting text...</span>
              </span>
              <span className="font-mono text-obsidian-ai font-bold">{uploadProgress || 0}%</span>
            </div>
            <div className="w-full h-2 bg-obsidian-bg rounded-full overflow-hidden border border-obsidian-border">
              <div
                className="h-full bg-gradient-to-r from-obsidian-emerald to-obsidian-ai transition-all duration-300"
                style={{ width: `${uploadProgress || 10}%` }}
              ></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 4. Filter Bar & Document Library */}
      <div className="glass-card p-4 rounded-obsidian border border-obsidian-border flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-obsidian-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document files by name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-obsidian glass-input"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-obsidian-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="EXTRACTED">Extracted</option>
            <option value="PARSED">Gemini Parsed</option>
          </select>
        </div>
      </div>

      {/* 5. Document Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="glass-card p-12 rounded-obsidian border border-obsidian-border text-center space-y-3">
          <FileText className="w-10 h-10 text-obsidian-text-muted mx-auto" />
          <h3 className="text-sm font-semibold text-obsidian-text-primary">No Documents Found</h3>
          <p className="text-xs text-obsidian-text-muted max-w-sm mx-auto">
            Upload your first PDF specification above to initiate Gemini AI extraction.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                projectName={doc.project_id ? projectsMap.get(doc.project_id) : undefined}
                onViewDetails={(d) => setSelectedDoc(d)}
                onParse={handleTriggerParse}
                isParsing={parsingDocId === doc.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Document Inspection Modal */}
      <DocumentDetailsModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        projectName={selectedDoc?.project_id ? projectsMap.get(selectedDoc.project_id) : undefined}
        onParse={handleTriggerParse}
        isParsing={parsingDocId === selectedDoc?.id}
      />
    </div>
  );
};

export default DocumentsPage;
