import React, { useEffect, useCallback } from 'react';
import { ErrorTracker } from '@error-tracker/core';
import { Severity } from '@error-tracker/core';

/**
 * React hook for error tracking
 */
export function useErrorTracker(tracker: ErrorTracker | null) {
  const captureException = useCallback(
    (error: Error, level: Severity = Severity.Error) => {
      tracker?.captureException(error, level);
    },
    [tracker]
  );

  const captureMessage = useCallback(
    (message: string, level: Severity = Severity.Info) => {
      tracker?.captureMessage(message, level);
    },
    [tracker]
  );

  const setUser = useCallback(
    (user: import('@error-tracker/core').User | null) => {
      tracker?.setUser(user);
    },
    [tracker]
  );

  const setTag = useCallback(
    (key: string, value: string) => {
      tracker?.setTag(key, value);
    },
    [tracker]
  );

  const setExtra = useCallback(
    (key: string, value: unknown) => {
      tracker?.setExtra(key, value);
    },
    [tracker]
  );

  return {
    captureException,
    captureMessage,
    setUser,
    setTag,
    setExtra,
  };
}

/**
 * React Error Boundary component
 */
export class ErrorBoundary extends React.Component<
  {
    tracker: ErrorTracker | null;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    children: React.ReactNode;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.tracker) {
      this.props.tracker.captureException(error, Severity.Error);
      this.props.tracker.setExtra('reactErrorInfo', errorInfo);
    }
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error} resetError={this.resetError} />;
      }
      return (
        <div>
          <h2>Something went wrong.</h2>
          <button onClick={this.resetError}>Try again</button>
        </div>
      );
    }

    return this.props.children;
  }
}

