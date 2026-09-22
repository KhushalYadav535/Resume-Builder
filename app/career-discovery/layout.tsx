import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Discovery & Role Assessment Engine | UpRole",
  description:
    "Discover your optimal career trajectory, evaluate cross-functional role transitions, and map your unique skills to market demand.",
  openGraph: {
    title: "Career Discovery Engine | UpRole",
    description:
      "Clarify your next career leap with structured self-discovery, market fit assessment, and customized transition roadmaps.",
  },
};

export default function CareerDiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
