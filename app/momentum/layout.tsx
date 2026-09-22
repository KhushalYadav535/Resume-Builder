import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Momentum | Career Priorities, Strategy & Execution Engine",
  description:
    "Define your career priorities and goals, audit readiness and gaps, execute strategic actions, and launch advanced interview, negotiation, and trajectory tools.",
};

export default function MomentumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
