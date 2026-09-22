import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.uprole.me";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/pricing",
          "/resume/templates",
          "/career-copilot",
          "/career-discovery",
          "/career-journal",
          "/privacy",
          "/terms",
          "/contact",
          "/thank-you",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/api",
          "/api/",
          "/auth/callback",
          "/dashboard",
          "/resume/builder",
          "/job-tracker",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
