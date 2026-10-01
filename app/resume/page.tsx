import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Studio — UpRole",
  description: "Build, tailor, and optimize your ATS-calibrated resume.",
};

export default function ResumeRootPage() {
  redirect("/resume/builder?new=true");
}
