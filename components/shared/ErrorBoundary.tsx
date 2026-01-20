// Error boundary component for better error handling
"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "@/components/ui/icons";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto bg-error-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-error-500" />
            </div>
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Something went wrong
            </h2>
            <p className="text-brand-text-secondary">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={this.resetError}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}