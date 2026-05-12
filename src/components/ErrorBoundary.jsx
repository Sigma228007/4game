import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-5">
          <div className="text-center space-y-5 max-w-sm">
            <h1
              className="font-display text-[80px] font-black leading-none"
              style={{ color: 'var(--text-faint)' }}
            >
              500
            </h1>
            <p className="font-display text-xl" style={{ color: 'var(--text-muted)' }}>
              Что-то пошло не так
            </p>
            <p className="font-body text-[13px]" style={{ color: 'var(--text-faint)' }}>
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
