import {
  AlertCircle,
  Download,
  FolderGit2,
  RefreshCw,
  RotateCcw,
  X,
} from 'lucide-react';
import {FormEvent, useEffect, useState} from 'react';
import {downloadStandaloneIndexHtml} from '../data/diontadoManifest';
import type {GitHubRepoConfig, GitHubRepoMeta} from '../types/gallery';

interface GitHubConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRepo: (rawRepo: string, branch: string, path: string, token: string) => Promise<void>;
  onResetToDemo: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  activeConfig: GitHubRepoConfig | null;
  repoMeta: GitHubRepoMeta | null;
}

export function GitHubConfigModal({
  isOpen,
  onClose,
  onSubmitRepo,
  onResetToDemo,
  isLoading,
  errorMessage,
  activeConfig,
  repoMeta,
}: GitHubConfigModalProps) {
  const [repoInput, setRepoInput] = useState('');
  const [branchInput, setBranchInput] = useState('');
  const [pathInput, setPathInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');

  useEffect(() => {
    if (activeConfig) {
      setRepoInput(`${activeConfig.owner}/${activeConfig.repo}`);
      setBranchInput(activeConfig.branch || '');
      setPathInput(activeConfig.path || '');
    }
  }, [activeConfig, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmitRepo(repoInput, branchInput, pathInput, tokenInput);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Connecter le dépôt GitHub DIONTADO PRODUCTION"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl rounded-xl border border-white/15 bg-[#111114] p-6 text-[#F5F3EE] shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C8A46B]">
              GitHub &amp; GitHub Pages
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-white">
              Charger vos images &amp; exporter index.html
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-stone-300 transition-colors hover:border-[#C8A46B] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-stone-400">
          Collez l’URL de votre dépôt GitHub pour afficher immédiatement vos 20 photos et 9 logos dans cet aperçu, ou téléchargez directement le fichier <span className="font-mono text-xs text-[#DFBE89]">index.html</span> complet prêt pour GitHub Pages.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="modal-repo-input" className="block text-xs font-medium text-[#E6DCCB]">
              URL du dépôt GitHub (ou utilisateur/depot)
            </label>
            <div className="relative mt-1.5">
              <FolderGit2
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                id="modal-repo-input"
                type="text"
                required
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="https://github.com/votre-compte/diontado-production"
                className="h-11 w-full rounded-lg border border-white/15 bg-[#070708] pl-10 pr-3 text-sm text-white placeholder:text-stone-500 focus:border-[#C8A46B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="modal-branch-input" className="block text-xs font-medium text-stone-400">
                Branche (optionnel)
              </label>
              <input
                id="modal-branch-input"
                type="text"
                value={branchInput}
                onChange={(e) => setBranchInput(e.target.value)}
                placeholder="main"
                className="mt-1 h-9 w-full rounded-lg border border-white/15 bg-[#070708] px-3 font-mono text-xs text-white focus:border-[#C8A46B] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="modal-path-input" className="block text-xs font-medium text-stone-400">
                Sous-dossier (optionnel)
              </label>
              <input
                id="modal-path-input"
                type="text"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                placeholder="images"
                className="mt-1 h-9 w-full rounded-lg border border-white/15 bg-[#070708] px-3 font-mono text-xs text-white focus:border-[#C8A46B] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="modal-token-input" className="block text-xs font-medium text-stone-400">
                Jeton (si dépôt privé)
              </label>
              <input
                id="modal-token-input"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_..."
                className="mt-1 h-9 w-full rounded-lg border border-white/15 bg-[#070708] px-3 font-mono text-xs text-white focus:border-[#C8A46B] focus:outline-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-xs leading-relaxed text-red-300"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {activeConfig ? (
              <button
                type="button"
                onClick={onResetToDemo}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Réinitialiser</span>
              </button>
            ) : (
              <span />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#C8A46B] px-5 text-sm font-semibold text-[#0B0A09] transition-colors hover:bg-[#DFBE89] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Chargement…</span>
                </>
              ) : (
                <span>Charger depuis GitHub</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <div className="text-xs text-stone-400">
            {repoMeta ? `Connecté : ${repoMeta.fullName}` : 'Fichier autonome HTML + CSS + JS'}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => downloadStandaloneIndexHtml(null)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/20 px-3 text-xs font-medium text-white transition-colors hover:border-[#C8A46B]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Télécharger index.html (GitHub Pages)</span>
            </button>
            {activeConfig && (
              <button
                type="button"
                onClick={() => downloadStandaloneIndexHtml(activeConfig)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-white/10 px-3 text-xs font-medium text-[#DFBE89] transition-colors hover:bg-white/20"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Avec URLs GitHub</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
