"use client";

import { useSyncExternalStore } from "react";

export type SyntheticAddressReview = {
  proofAddress: string;
  finalAddress: string;
  hasMinorDifference: boolean;
  clarificationSigned: boolean;
};

export type DemoJourneyState = {
  aarohiContactReady: boolean;
  aarohiMedicalReady: boolean;
  aarohiPacketReady: boolean;
  aarohiAddressReview: SyntheticAddressReview | null;
  rohanPacketReady: boolean;
  rohanAddressReview: SyntheticAddressReview | null;
  nehaSummaryReady: boolean;
  nehaEvidenceRetained: string[];
};

const storageKey = "sahisetu-demo-journey-state";
const eventName = "sahisetu-demo-journey-state-change";
const defaultState: DemoJourneyState = {
  aarohiContactReady: false,
  aarohiMedicalReady: false,
  aarohiPacketReady: false,
  aarohiAddressReview: null,
  rohanPacketReady: false,
  rohanAddressReview: null,
  nehaSummaryReady: false,
  nehaEvidenceRetained: [],
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
