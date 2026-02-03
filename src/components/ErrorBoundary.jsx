import { Component } from "react";
import { Link } from "react-router-dom";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to monitoring (Sentry, etc.)
    // console.error(error, info);
    this.props?.onError?.(error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#f4f2ee] flex items-center justify-center px-4">
        <div className="unir-card p-8 max-w-[560px] w-full">
          <h1 className="text-2xl font-semibold text-[rgba(0,0,0,0.9)]">Something went wrong</h1>
          <p className="mt-2 text-sm text-[rgba(0,0,0,0.6)]">
            Please refresh the page. If this keeps happening, contact support.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="unir-btn-primary" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <Link className="unir-btn-secondary" to="/">
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

