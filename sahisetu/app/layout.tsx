import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SahiSetu | Clear your documents before scrutiny begins",
  description: "An independent prototype for clearer RTO address-change applications.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
