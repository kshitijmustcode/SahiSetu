"use client";

import { useSyncExternalStore } from "react";

export type Language = "en" | "hi";

const eventName = "sahisetu-language";

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback);
  return () => window.removeEventListener(eventName, callback);
}

function getSnapshot(): Language {
  return window.localStorage.getItem(eventName) === "hi" ? "hi" : "en";
}

function getServerSnapshot(): Language {
  return "en";
}

export function useLanguage() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setLanguage(language: Language) {
  window.localStorage.setItem(eventName, language);
  window.dispatchEvent(new Event(eventName));
}

export function LanguageToggle() {
  const language = useLanguage();

  return (
    <div className="flex rounded-lg border border-[#d7e1d7] bg-white p-1 text-xs font-semibold" aria-label="Language">
      <button
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-md px-2.5 py-1.5 ${language === "en" ? "bg-[#193b63] text-white" : "text-[#526558]"}`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage("hi")}
        aria-pressed={language === "hi"}
        className={`rounded-md px-2.5 py-1.5 ${language === "hi" ? "bg-[#193b63] text-white" : "text-[#526558]"}`}
      >
        हिन्दी
      </button>
    </div>
  );
}
