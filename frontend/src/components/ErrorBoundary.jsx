import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="card text-center max-w-sm">
            <div className="text-5xl mb-4">😥</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              कुछ गलत हो गया
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Something went wrong</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              फिर कोशिश करें / Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
