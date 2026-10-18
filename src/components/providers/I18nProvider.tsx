"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import enCommon from "@/data/translations/en/common.json";
import hiCommon from "@/data/translations/hi/common.json";

const NS = "common" as const;

const resources = {
  en: { [NS]: enCommon },
  hi: { [NS]: hiCommon },
} as const;

export type Locale = keyof typeof resources;

const STORAGE_KEY = "lang";
const isBrowser = typeof window !== "undefined";

/**
 * Resources are bundled and i18next initialised synchronously at module
 * scope, not streamed from a backend. No suspense boundary, no blank first
 * paint: every page here is server-rendered, and the translated chrome needs
 * to be in the initial HTML for both LCP and indexing.
 *
 * Default language is always `en`. The browser preference is only read once,
 * client-side, so the server and the first client render agree and hydration
 * cannot mismatch.
 */
// `init` returns a promise that resolves once the backend has loaded the
// bundled resources. There is no backend here — everything is inline — so it
// settles during module evaluation, well before any component reads a
// translation. The `void` marks that intent rather than leaving a floating
// promise for the type-aware linter.
void i18next.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  defaultNS: NS,
  ns: [NS],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

if (isBrowser && i18next.language === "en") {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "hi") void i18next.changeLanguage("hi");
}

function subscribe(callback: () => void): () => void {
  i18next.on("languageChanged", callback);
  return () => i18next.off("languageChanged", callback);
}

const getSnapshot = () => i18next.language as Locale;
const getServerSnapshot = () => "en" as Locale;

/**
 * Returns the active locale and a setter that persists the choice. Re-renders
 * on every change because i18next emits `languageChanged` on its own bus, so
 * a language switch in the nav updates the whole tree without any context.
 */
export function useLanguage(): [Locale, (next: Locale) => void] {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const change = (next: Locale) => {
    void i18next.changeLanguage(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return [locale, change];
}

export function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
