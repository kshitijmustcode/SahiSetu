"use client";

import { useSyncExternalStore } from "react";

export type DemoJourneyState = {
  aarohiContactReady: boolean;
  aarohiPacketReady: boolean;
  rohanPacketReady: boolean;
  nehaSummaryReady: boolean;
};

const storageKey = "sahisetu-demo-journey-state";
const eventName = "sahisetu-demo-journey-state-change";
const defaultState: DemoJourneyState = {
  aarohiContactReady: false,
  aarohiPacketReady: false,
  rohanPacketReady: false,
  nehaSummaryReady: false,
};
let cachedValue: string | null = null;
let cachedState = defaultState;

function readState(): DemoJourneyState {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === cachedValue) return cachedState;
    cachedValue = saved;
    cachedState = saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    return cachedState;
  } catch {
    return defaultState;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(eventName, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useDemoJourneyState() {
  return useSyncExternalStore(subscribe, readState, () => defaultState);
}

export function setDemoJourneyState(update: Partial<DemoJourneyState>) {
  window.localStorage.setItem(storageKey, JSON.stringify({ ...readState(), ...update }));
  window.dispatchEvent(new Event(eventName));
}

export function resetDemoJourneyState() {
  cachedValue = null;
  cachedState = defaultState;
  window.localStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(eventName));
}
