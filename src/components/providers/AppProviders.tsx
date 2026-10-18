"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "./I18nProvider";

/**
 * Client provider stack. Kept thin on purpose:
 *   - i18n is initialised at module scope and needs no provider around it
 *     beyond a mount point
 *   - Supabase is created lazily per component via `getBrowserSupabase()`, so
 *     it is not in this tree at all. Any auth-dependent surface pulls it in
 *     itself, which keeps the Supabase runtime out of the initial bundle for
 *     visitors who never touch an auth surface.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}
