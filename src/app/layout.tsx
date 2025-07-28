import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import ErrorBoundary from "../components/ErrorBoundary";
import AccessibilityWrapper from "../components/ui/AccessibilityWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "偉人カレンダー",
  description: "毎日偉人の知恵に触れよう",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full overflow-hidden`}
      >
        <AccessibilityWrapper>
          <ErrorBoundary>
            <SessionProviderWrapper>
              {children}
            </SessionProviderWrapper>
          </ErrorBoundary>
        </AccessibilityWrapper>
      </body>
    </html>
  );
}
