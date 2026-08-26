import React, { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#101010] text-white p-6">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 rounded-xl border border-[#454545] bg-[#111111] text-center shadow-2xl">
            <div className="h-16 w-16 rounded-full bg-[#a8751c]/10 flex items-center justify-center mb-4 border border-[#a8751c]/30">
              <AlertTriangle className="h-8 w-8 text-[#a8751c]" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Something went wrong</h2>
            <p className="text-sm text-[#c9c2b6] mb-6 max-w-md">
              An unexpected error occurred in the Gorilla Gear Nutrition interface.
            </p>
            {this.state.error && (
              <div className="w-full bg-black/60 border border-[#454545] rounded-lg p-4 mb-6 text-left overflow-x-auto">
                <code className="text-xs text-[#a8751c] font-mono">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #a8751c, #7c5a20)" }}
            >
              <RotateCcw className="h-4 w-4" /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
