'use client';

import { createContext, useContext } from 'react';

export type PaymentTab = 'oss' | 'services';

export interface UiApi {
  /** Buka modal pembayaran/donasi. Default tab: donasi OSS. */
  openPayment: (tab?: PaymentTab) => void;
  /** Buka command palette (Ctrl/Cmd+K). */
  openCommand: () => void;
}

export const UiContext = createContext<UiApi>({
  openPayment: () => {},
  openCommand: () => {},
});

export const useUi = () => useContext(UiContext);
