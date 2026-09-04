"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageToggle } from "./language-toggle";

type SiteNavigationProps = {
  children?: ReactNode;
  className?: string;
};

export function SiteNavigation({ children, className = "" }: SiteNavigationProps) {
  return (
    <nav className={`flex items-center justify-between gap-3 ${className}`} aria-label="Main navigation">
      <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#166534] text-lg text-white shadow-sm">
          स
        </span>
        <span className="text-xl">SahiSetu</span>
      </Link>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        {children}
      </div>
    </nav>
  );
}

type SiteFooterProps = {
  children: ReactNode;
  className?: string;
};

export function SiteFooter({ children, className = "" }: SiteFooterProps) {
  return <footer className={`border-t border-[#e1eade] py-7 text-sm text-[#66796a] ${className}`}>{children}</footer>;
}
