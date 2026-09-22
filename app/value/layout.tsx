import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Value | UpRole Career Advancement Platform",
  description:
    "Your professional experience, achievements, capabilities, and career evidence extracted from your resume.",
};

export default function ValueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
