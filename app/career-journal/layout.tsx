import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Journal & Professional Story Engine | UpRole",
  description:
    "Document daily wins, project milestones, and professional impact. Transform raw achievements into high-impact resume bullets with AI extraction.",
  openGraph: {
    title: "Career Journal & Professional Story Engine | UpRole",
    description:
      "Never forget your achievements. Track impact as it happens and turn work journals into executive resume accomplishments.",
  },
};

export default function CareerJournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
