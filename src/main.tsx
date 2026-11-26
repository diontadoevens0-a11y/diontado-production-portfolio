import {Component, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  error: Error | null;
}

class AppErrorBoundary extends Component<{children: ReactNode}, ErrorBoundaryState> {
  state: ErrorBoundaryState = {error: null};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {error};
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#070708] p-6 text-center text-[#F5F3EE]">
          <h1 className="font-display text-3xl font-semibold text-white">
            DIONTADO PRODUCTION
          </h1>
          <p className="mt-3 max-w-md text-sm text-stone-400">
            Une erreur d’affichage est survenue : {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-[#C8A46B] px-5 py-2.5 text-sm font-semibold text-[#0B0A09]"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}
