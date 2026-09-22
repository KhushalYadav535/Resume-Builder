import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Career Plans | UpRole",
  description:
    "Explore transparent, flexible plans for career acceleration. Free ATS scans, Sprint accelerator, and Pro career transformation with AI assistance.",
  openGraph: {
    title: "Pricing & Career Plans | UpRole",
    description:
      "Invest in your career with clear, fair pricing. Free, Sprint, and Pro tiers tailored for modern job seekers.",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
