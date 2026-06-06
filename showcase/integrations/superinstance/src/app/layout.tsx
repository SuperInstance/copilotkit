import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuperInstance Fleet Copilot",
  description: "AI-powered fleet management dashboard for SuperInstance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
