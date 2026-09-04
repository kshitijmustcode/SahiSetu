import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SahiSetu | Stay ready before transport paperwork becomes urgent",
  description:
    "A demo prototype for driving-licence readiness, document checks, and clear application recovery guidance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
