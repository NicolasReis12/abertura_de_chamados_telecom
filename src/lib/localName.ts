'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'central-chamados:nome-usuario';

export function getStoredName(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredName(name: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, name);
}

function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return null;
}

// Reads the name saved in this browser without a mount-time effect: the value
// isn't known during SSR, so this relies on useSyncExternalStore's built-in
// server/client reconciliation instead of the effect+setState two-pass dance.
export function useStoredName(): string | null {
  return useSyncExternalStore(subscribe, getStoredName, getServerSnapshot);
}
