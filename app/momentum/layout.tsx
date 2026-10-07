import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Momentum | Career Direction, Goals & Milestone Progress · UpRole",
  description:
    "Where do you want your career to go? UpRole Momentum converts your career priorities into active goals, clear directions, and visible milestone progress.",
};

export default function MomentumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
