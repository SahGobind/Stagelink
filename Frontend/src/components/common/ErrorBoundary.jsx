import React from 'react';
import ErrorState from './ErrorState';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <ErrorState
            title="We encountered an issue loading this view"
            message={this.state.error?.message || 'A temporary display error occurred. Click reload to refresh this section.'}
            onRetry={this.handleRetry}
            className="max-w-md w-full"
          />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
