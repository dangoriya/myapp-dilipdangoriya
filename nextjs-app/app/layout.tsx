import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import TopProgressBar from "./components/ui/TopProgressBar";

export const metadata: Metadata = {
  title: "App Workspace - Centralized Launchpad",
  description: "Centralized application gallery for quick access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TopProgressBar />
        {children}
      </body>
    </html>
  );
}
