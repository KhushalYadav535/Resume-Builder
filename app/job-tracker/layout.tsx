import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Opportunity Pipeline & Job Pursuit Tracker | UpRole",
  description:
    "Organize your job search in a high-velocity Kanban pipeline. Track applications, calculate JD keyword match scores, and conquer interview rounds.",
  openGraph: {
    title: "Opportunity Pipeline & Job Pursuit Tracker | UpRole",
    description:
      "Turn job applications into successful offers with structured stage tracking, velocity metrics, and JD match analysis.",
  },
};

export default function JobTrackerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
