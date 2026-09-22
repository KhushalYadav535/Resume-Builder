import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATS-Optimized Resume Templates | UpRole",
  description:
    "Free, professional, and ATS-tested resume templates designed for software engineers, product managers, data analysts, and executive leaders.",
  openGraph: {
    title: "ATS Resume Templates | UpRole",
    description:
      "Handcrafted templates built to pass enterprise Applicant Tracking Systems with 90%+ parse scores.",
  },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
