import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { projectService } from '../../services/projectService';
import { SearchMatch, SearchResponse } from '../../types/ai';
import Skeleton from '../../components/common/Skeleton';
import { useToast } from '../../context/ToastContext';

const suggestedQueries = [
  'Which project requires 50 Heavy Duty Cooling Towers?',
  'What is the safety protocol specification for Al Zour Refinery?',
  'List all 100MW turbine generator requirements.',
  'What are the comprehensive warranty terms for high pressure piping?',
];

const SearchPage: React.FC = () => {
  const { error: showError } = useToast();

  const [query, setQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Cooling Towers specification',
    'ISO 45001 safety compliance',
    'Siemens turbine specs',
  ]);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);

  // Fetch Projects for Filter
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Vector Search Mutation
  const searchMutation = useMutation({
    mutationFn: ({ q, projId }: { q: string; projId?: string }) =>
      aiService.searchVector(q, projId),
    onSuccess: (data) => {
      setSearchResult(data);
      if (!recentSearches.includes(data.query)) {
        setRecentSearches((prev) => [data.query, ...prev.slice(0, 4)]);
      }
    },
    onError: (err: any) => {
      showError('Search Failed', err.response?.data?.detail || 'Vector search execution error.');
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate({ q: query, projId: selectedProjectId });
  };

  const handleSelectSuggested = (qText: string) => {
    setQuery(qText);
    searchMutation.mutate({ q: qText, projId: selectedProjectId });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-obsidian-border/80">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-obsidian-ai uppercase">
            GROUNDED RAG RETRIEVAL
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-obsidian-text-primary tracking-tight mt-0.5">
            Global AI Vector Search
          </h1>
          <p className="text-xs text-obsidian-text-secondary mt-1">
            Ask natural language questions over indexed EPC document specifications with page citations.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-obsidian bg-obsidian-card border border-obsidian-ai/30 shadow-ai-glow">
          <Sparkles className="w-4 h-4 text-obsidian-ai animate-spin" />
          <span className="text-xs font-semibold text-obsidian-ai">FAISS Vector Index Active</span>
        </div>
      </div>

      {/* 2. Main Search Bar Card */}
      <div className="glass-card p-6 rounded-obsidian border border-obsidian-border space-y-4 shadow-glass">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-obsidian-ai" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a technical or compliance question across all EPC PDF specs..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-obsidian glass-input border-obsidian-ai/40 focus:border-obsidian-ai shadow-ai-glow"
            />
          </div>

          {/* Project Selector */}
          <div className="w-full md:w-64 flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-obsidian-emerald flex-shrink-0" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
            >
              <option value="ALL">All Projects (Global)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={searchMutation.isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg font-bold text-xs rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {searchMutation.isPending ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </span>
            ) : (
              <>
                <span>Search Vectors</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Suggested Questions Chips */}
        <div className="pt-2 border-t border-obsidian-border/50 space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-obsidian-text-muted uppercase block">
            SUGGESTED QUESTIONS
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggested(sq)}
                className="px-3 py-1.5 rounded-full bg-obsidian-surface/60 hover:bg-obsidian-card border border-obsidian-border hover:border-obsidian-ai/40 text-[11px] text-obsidian-text-secondary hover:text-obsidian-ai transition-colors flex items-center space-x-1.5 text-left"
              >
                <Sparkles className="w-3 h-3 text-obsidian-ai flex-shrink-0" />
                <span>{sq}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches Chips */}
        {recentSearches.length > 0 && (
          <div className="flex items-center space-x-2 pt-1">
            <Clock className="w-3.5 h-3.5 text-obsidian-text-muted" />
            <span className="text-[11px] text-obsidian-text-muted">Recent:</span>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((rs, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggested(rs)}
                  className="px-2 py-0.5 rounded bg-obsidian-card text-[10px] text-obsidian-text-muted hover:text-obsidian-text-primary border border-obsidian-border transition-colors"
                >
                  {rs}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Search Results Render */}
      {searchMutation.isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : searchResult ? (
        <div className="space-y-6">
          {/* AI Synthesized Answer Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-obsidian border border-obsidian-ai/40 shadow-ai-glow space-y-3"
          >
            <div className="flex justify-between items-center border-b border-obsidian-border/60 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-obsidian-ai animate-pulse" />
                <h3 className="text-sm font-bold text-obsidian-text-primary">
                  Synthesized Answer for: <span className="text-obsidian-ai">"{searchResult.query}"</span>
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-obsidian-emerald/20 text-obsidian-emerald border border-obsidian-emerald/30 font-bold">
                HIGH CONFIDENCE RAG
              </span>
            </div>

            <p className="text-xs text-obsidian-text-primary leading-relaxed whitespace-pre-wrap">
              {searchResult.answer}
            </p>

            <div className="pt-2 flex items-center space-x-4 text-[11px] text-obsidian-text-muted">
              <span>Retrieved Chunks: <strong>{searchResult.matches?.length || 0}</strong></span>
              <span>•</span>
              <span>Vector Model: <strong>384-dim FAISS</strong></span>
            </div>
          </motion.div>

          {/* Document Citation Matches Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-obsidian-text-primary uppercase tracking-wider flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-obsidian-emerald" />
              <span>Matching Specification Citations ({searchResult.matches?.length || 0})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {searchResult.matches.map((match: SearchMatch, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-4 rounded-obsidian border border-obsidian-border hover:border-obsidian-emerald/40 transition-all space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-obsidian-emerald flex-shrink-0" />
                        <span className="text-xs font-bold text-obsidian-text-primary truncate max-w-[200px]" title={match.filename}>
                          {match.filename}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-emerald/20 text-obsidian-emerald border border-obsidian-emerald/30 font-bold">
                        Score: {(match.score * 100).toFixed(1)}%
                      </span>
                    </div>

                    <p className="text-xs text-obsidian-text-secondary line-clamp-3 bg-obsidian-bg/60 p-2.5 rounded-obsidian font-mono text-[11px] leading-relaxed">
                      "{match.snippet}"
                    </p>

                    <div className="flex justify-between items-center text-[10px] text-obsidian-text-muted pt-1">
                      <span>Page: {match.page_number || 1}</span>
                      <span className="text-obsidian-ai font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-obsidian-ai" />
                        <span>Vector Grounded</span>
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchPage;
