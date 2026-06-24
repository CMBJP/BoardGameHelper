import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="panel">
          <h2>화면을 불러오지 못했습니다</h2>
          <p>잠시 뒤 새로고침하거나 메인 화면에서 다시 시도해 주세요.</p>
          <button className="primary-button" onClick={() => window.location.reload()} aria-label="앱 새로고침">
            새로고침
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
