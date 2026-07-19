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
  title: "UpRole — Discover Your Value. Communicate It Better.",
  description: "UpRole's AI finds the achievements you forgot to mention — and turns them into a resume that's ATS-ready and interview-ready. Free to start.",
  icons: {
    icon: "/logo symbol.png",
    apple: "/UpRole logo.jpeg",
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
        <link rel="icon" type="image/png" href="/logo symbol.png" />
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
