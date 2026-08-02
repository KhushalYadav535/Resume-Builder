import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ui/toast-1";
import CreditBannerWrapper from "@/components/credits/CreditBannerWrapper";
import ReferralTracker from "@/components/ReferralTracker";
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.uprole.me"),
  title: "UPROLE — Build & Optimize Your Resume",
  description: "Outsmart the ATS. Land the Interview. Stop guessing what recruiters want. Let our elite AI engine perfect, optimize, and score your resume in seconds.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "UPROLE — Build & Optimize Your Resume",
    description: "Outsmart the ATS. Land the Interview. Stop guessing what recruiters want. Let our elite AI engine perfect, optimize, and score your resume in seconds.",
    url: "https://www.uprole.me",
    siteName: "UpRole",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "UpRole Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "UPROLE — Build & Optimize Your Resume",
    description: "Outsmart the ATS. Land the Interview. Stop guessing what recruiters want.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('resume-optimizer-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
        <AuthProvider>
          <ToastProvider>
            {children}
            <CreditBannerWrapper />
            <ReferralTracker />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
