import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CYBER // OS — Security Learning Platform",
  description: "Full-stack cybersecurity study platform with Notion-style note editor, study timer, admin telemetry, and PDF exports.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090d16] text-[#e2e8f0]">
        {children}
      </body>
    </html>
  );
}
