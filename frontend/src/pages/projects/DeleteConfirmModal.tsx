import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Project } from '../../types/project';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  project: Project | null;
  isLoading: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  project,
  isLoading,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md rounded-obsidian border border-obsidian-danger/40 shadow-glass overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-obsidian-danger/10 border border-obsidian-danger/30 flex items-center justify-center mx-auto text-obsidian-danger">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-obsidian-text-primary">Delete Project Node?</h3>
            <p className="text-xs text-obsidian-text-secondary leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-obsidian-text-primary">"{project.project_name}"</strong>?
              This action will remove all linked POs, milestones, and metadata.
            </p>
          </div>

          <div className="pt-4 flex justify-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-obsidian-text-secondary hover:text-obsidian-text-primary rounded-obsidian border border-obsidian-border hover:bg-obsidian-card transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold bg-obsidian-danger text-white rounded-obsidian shadow-[0_0_15px_rgba(255,77,109,0.3)] hover:opacity-90 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
