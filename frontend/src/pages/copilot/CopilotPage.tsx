import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  FileText,
  Bookmark,
  FolderKanban,
  CheckCircle2,
  Zap,
  RotateCcw
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { projectService } from '../../services/projectService';
import { CopilotMessage } from '../../types/ai';
import { useToast } from '../../context/ToastContext';

const suggestedPrompts = [
  'Which vendor has the highest spec compliance score?',
  'What are the critical risks flagged on NEOM Green Hydrogen?',
  'Compare transformer specifications between Al Zour and NEOM.',
  'Show all purchase orders above $10M.',
];

const CopilotPage: React.FC = () => {
  const { error: showError } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        "Hello! I am your **NEXORA AI Procurement Copilot**. I have full grounded RAG context over all project specifications, vendor proposals, and risk evaluations. How can I assist your C-Suite decision making today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        {
          document_id: 'doc-1',
          filename: 'al_zour_spec.pdf',
          page_number: 1,
          confidence: 0.98,
          snippet: 'Al Zour Refinery EPC Specification Overview',
        },
      ],
      confidence_score: 0.98,
    },
  ]);

  // Fetch Projects for Filter
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Copilot Mutation
  const copilotMutation = useMutation({
    mutationFn: (msgText: string) =>
      aiService.chatCopilot(msgText, conversationId, selectedProjectId),
    onSuccess: (data, msgText) => {
      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      const assistantMsg: CopilotMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations || [],
        confidence_score: data.confidence_score || 0.95,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    },
    onError: (err: any) => {
      showError('Copilot Failed', err.response?.data?.detail || 'AI Assistant response error.');
    },
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || copilotMutation.isPending) return;

    const userMsg: CopilotMessage = {
      id: Math.random().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    copilotMutation.mutate(currentInput);
  };

  const handlePromptClick = (promptText: string) => {
    setInput(promptText);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        content: "Conversation history cleared. Ready for your next query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, copilotMutation.isPending]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-obsidian-border/80 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-obsidian bg-obsidian-ai/10 border border-obsidian-ai/30 text-obsidian-ai shadow-ai-glow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-obsidian-text-primary flex items-center space-x-2">
              <span>AI Procurement Copilot</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-obsidian-ai/20 text-obsidian-ai border border-obsidian-ai/30">
                GEMINI 1.5 RAG
              </span>
            </h1>
            <p className="text-xs text-obsidian-text-secondary mt-0.5">
              Grounded conversational decision assistant with document citations.
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FolderKanban className="w-4 h-4 text-obsidian-emerald flex-shrink-0" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-obsidian glass-input bg-obsidian-surface text-obsidian-text-primary border-obsidian-border"
            >
              <option value="ALL">All Projects Context</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-obsidian bg-obsidian-card hover:bg-obsidian-border border border-obsidian-border text-obsidian-text-muted hover:text-obsidian-text-primary transition-colors"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="flex-1 glass-card rounded-obsidian border border-obsidian-border overflow-hidden flex flex-col">
        {/* Messages Feed */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start space-x-3 ${
                  msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-tr from-obsidian-emerald to-obsidian-ai text-obsidian-bg shadow-emerald-glow'
                      : 'bg-obsidian-card border border-obsidian-ai/40 text-obsidian-ai shadow-ai-glow'
                  }`}
                >
                  {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className={`max-w-2xl space-y-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`p-4 rounded-obsidian text-xs leading-relaxed inline-block ${
                      msg.sender === 'user'
                        ? 'bg-obsidian-emerald/20 text-obsidian-text-primary border border-obsidian-emerald/40'
                        : 'bg-obsidian-surface/80 text-obsidian-text-primary border border-obsidian-border backdrop-blur-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Timestamp */}
                    <span className="block text-[9px] text-obsidian-text-muted mt-2">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Document Citations if Assistant */}
                  {msg.sender === 'assistant' && msg.citations && msg.citations.length > 0 && (
                    <div className="p-3 rounded-obsidian bg-obsidian-bg/80 border border-obsidian-ai/30 text-left space-y-2 text-[11px]">
                      <div className="flex items-center space-x-1.5 text-obsidian-ai font-semibold">
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Grounded Document Citations</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.citations.map((c, idx) => (
                          <div key={idx} className="flex items-center justify-between text-obsidian-text-secondary bg-obsidian-card/60 p-2 rounded border border-obsidian-border/50">
                            <div className="flex items-center space-x-2 truncate">
                              <FileText className="w-3.5 h-3.5 text-obsidian-emerald flex-shrink-0" />
                              <span className="font-semibold text-obsidian-text-primary truncate">{c.filename}</span>
                              {c.page_number && <span className="text-[10px] text-obsidian-text-muted">(Pg {c.page_number})</span>}
                            </div>
                            <span className="text-[10px] font-mono text-obsidian-ai font-bold">
                              {(c.confidence * 100).toFixed(0)}% Match
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator Animation */}
          {copilotMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-obsidian-card border border-obsidian-ai/40 text-obsidian-ai flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-obsidian bg-obsidian-surface border border-obsidian-border flex items-center space-x-2 text-xs text-obsidian-ai">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Searching vector index & generating response...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Bar */}
        <div className="p-3 border-t border-obsidian-border/60 bg-obsidian-bg/40 flex items-center space-x-2 overflow-x-auto">
          <Zap className="w-3.5 h-3.5 text-obsidian-gold flex-shrink-0 ml-1" />
          <div className="flex space-x-2">
            {suggestedPrompts.map((pText, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(pText)}
                className="px-2.5 py-1 rounded-full bg-obsidian-surface hover:bg-obsidian-card border border-obsidian-border hover:border-obsidian-ai/30 text-[10px] text-obsidian-text-secondary hover:text-obsidian-ai whitespace-nowrap transition-colors"
              >
                {pText}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-obsidian-border bg-obsidian-surface/60 flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot about specifications, vendor scores, or delivery risks..."
            className="flex-1 px-4 py-2.5 text-xs rounded-obsidian glass-input border-obsidian-ai/30 focus:border-obsidian-ai"
          />
          <button
            type="submit"
            disabled={!input.trim() || copilotMutation.isPending}
            className="px-4 py-2.5 bg-gradient-to-r from-obsidian-emerald to-obsidian-ai text-obsidian-bg font-bold text-xs rounded-obsidian shadow-emerald-glow hover:opacity-95 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CopilotPage;
