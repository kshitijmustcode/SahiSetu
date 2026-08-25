import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SahiSetu | Prepare your new address before applying",
  description: "Upload a current licence and proof of new address to create a reviewable address for your Parivahan application.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
