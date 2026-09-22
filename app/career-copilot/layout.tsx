import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Copilot & Growth Intelligence | UpRole",
  description:
    "AI-powered career mentor for technical professionals. Get real-time salary benchmarks, predictive interview preparation, and skill gap roadmaps.",
  openGraph: {
    title: "Career Copilot & Growth Intelligence | UpRole",
    description:
      "Strategic career guidance calibrated for Indian and global tech markets.",
  },
};

export default function CareerCopilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
