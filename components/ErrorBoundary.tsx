'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Fallback kustom; tanpa ini dipakai fallback default (teks + tombol coba lagi). */
  fallback?: ReactNode;
  /** Ubah nilai kunci = reset boundary otomatis (pola react-error-boundary). */
  resetKeys?: ReadonlyArray<unknown>;
  /** Callback saat error tertangkap — untuk logging / strategi degrade. */
  onError?: (error: unknown, info: ErrorInfo) => void;
  label?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Error boundary — memastikan satu komponen yang crash (mis. scene 3D pada
 * GPU bermasalah) tidak menjatuhkan seluruh halaman.
 *
 * Fitur:
 *  - `resetKeys`: boundary menyembuhkan diri saat kunci berubah — dipakai
 *    Hero3D (`resetKeys={[mode]}`): error pada Scene3D → onError menurunkan
 *    mode ke 'lite' → kunci berubah → boundary reset → SceneLite merender.
 *  - `onError`: hook untuk strategi degrade/logging di komponen pemakai.
 *  - Fallback default aksesibel (role="alert") + tombol "Coba lagi" yang
 *    mereset boundary tanpa reload halaman.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? `: ${this.props.label}` : ''}]`, error, info.componentStack ?? '');
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prev: Props) {
    // Sembuhkan otomatis saat resetKeys berubah (hanya saat sedang error).
    if (this.state.hasError && this.props.resetKeys && prev.resetKeys) {
      const changed = this.props.resetKeys.some((k, i) => !Object.is(k, prev.resetKeys?.[i]));
      if (changed) this.setState({ hasError: false });
    }
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) return this.props.fallback;
      return (
        <div
          role="alert"
          className="flex h-full min-h-40 flex-col items-center justify-center gap-3 px-6 text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/40">
            {this.props.label ? `${this.props.label} gagal dirender` : 'komponen gagal dirender'} — halaman tetap aman
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-cream/70 transition hover:border-ember/50 hover:text-cream"
          >
            <RotateCcw className="size-3" />
            Coba lagi
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
