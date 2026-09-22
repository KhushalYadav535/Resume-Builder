import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In to Your UpRole Account | UpRole",
  description:
    "Log in to UpRole to access your AI resume builder, opportunity pipeline, and career intelligence dashboard.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
