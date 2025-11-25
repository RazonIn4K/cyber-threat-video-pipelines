import React from 'react';

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Boundary caught', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center space-y-4">
          <p className="text-lg font-semibold text-status-error">Something went wrong.</p>
          <p className="text-sm text-gray-400">{this.state.message}</p>
          <button className="btn-ghost" onClick={() => this.setState({ hasError: false, message: undefined })}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
