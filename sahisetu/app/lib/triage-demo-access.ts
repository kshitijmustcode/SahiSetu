"use client";

import { useSyncExternalStore } from "react";

const storageKey = "sahisetu-triage-demo-access";
const eventName = "sahisetu-triage-demo-access-change";
let cachedValue: string | null = null;
let cachedAccess = false;

function readAccess() {
  try {
    const saved = window.sessionStorage.getItem(storageKey);
    if (saved === cachedValue) return cachedAccess;
    cachedValue = saved;
    cachedAccess = saved === "granted";
    return cachedAccess;
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}

export function useTriageDemoAccess() {
  return useSyncExternalStore(subscribe, readAccess, () => false);
}

export function grantTriageDemoAccess() {
  cachedValue = "granted";
  cachedAccess = true;
  window.sessionStorage.setItem(storageKey, "granted");
  window.dispatchEvent(new Event(eventName));
}

export function revokeTriageDemoAccess() {
  cachedValue = null;
  cachedAccess = false;
  window.sessionStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(eventName));
}
