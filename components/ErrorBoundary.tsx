'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary ringan — memastikan satu komponen yang crash (mis. scene 3D
 * pada GPU bermasalah) tidak menjatuhkan seluruh halaman.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ''}]`, error, info.componentStack ?? '');
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-40 items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em] text-cream/40">
            komponen gagal dirender — halaman tetap aman
          </div>
        )
      );
    }
    return this.props.children;
  }
}
