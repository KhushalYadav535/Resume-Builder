import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Free UpRole Account | UpRole",
  description:
    "Join thousands of ambitious professionals accelerating their careers with AI-powered resume optimization, career discovery, and pursuit tracking.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
