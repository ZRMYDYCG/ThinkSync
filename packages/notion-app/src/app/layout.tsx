import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Notion",
    description: "A new way to work with notes and tasks",
    icons: {
      icon: [
          {
              media: "(prefers-color-scheme: light)",
              url: "/logo.svg",
              href: "/logo.svg"
          },
          {
              media: "(prefers-color-scheme: dark)",
              url: "/logo-dark.svg",
              href: "/logo-dark.svg"
          },
      ]
    }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
