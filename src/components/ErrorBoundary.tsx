"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

class ErrorBoundary extends React.Component<{ children: React.ReactNode; pathname?: string }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode; pathname?: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  componentDidUpdate(prevProps: { pathname?: string }) {
    // Reset error boundary when pathname changes (navigation occurred)
    if (prevProps.pathname !== this.props.pathname && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-8">We&apos;re sorry, but something unexpected happened.</p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-block bg-[#0046be] hover:bg-[#003494] text-white px-6 py-3 rounded-lg transition-colors duration-300"
              >
                Return to Home
              </Link>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}
                className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide pathname to ErrorBoundary
export default function ErrorBoundaryWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return <ErrorBoundary pathname={pathname}>{children}</ErrorBoundary>;
} 