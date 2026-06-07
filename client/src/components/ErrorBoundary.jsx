import React from 'react';
import { ShieldAlert, RefreshCw, Trash2 } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    try {
      localStorage.setItem('last_crash', error.toString() + '\n' + errorInfo.componentStack);
    } catch (e) {}
    
    // Only redirect if we are not already on the dashboard, otherwise we get an infinite loop
    if (window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard';
    }
  }

  handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      if (window.location.pathname !== '/dashboard') {
        return null; // Return null while the browser redirects
      }
      
      // Fallback UI for dashboard crashes
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative selection:bg-white/20 selection:text-white">
          <div className="ambient-glow fixed inset-0 pointer-events-none" />
          <div className="max-w-md w-full apple-glass-panel border border-red-500/20 bg-red-500/5 rounded-[2.5rem] p-8 sm:p-10 apple-shadow relative z-10 text-center animate-fade-up">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-red-500/10 border border-red-500/20 mb-6">
              <ShieldAlert className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight mb-3">System Error</h1>
            <p className="text-white/60 mb-8 font-medium">
              We encountered a critical error while loading the dashboard. 
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors shadow-lg"
              >
                <RefreshCw className="h-5 w-5" />
                Reload Page
              </button>
              <button 
                onClick={this.handleClearCache}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
                Clear Local Data & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}
