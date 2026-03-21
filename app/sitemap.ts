import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";

const BASE_URL = "https://my-fanpage.vercel.app";
const postsDir = path.join(process.cwd(), "content/posts");

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic post pages
  let postPages: MetadataRoute.Sitemap = [];

  if (fs.existsSync(postsDir)) {
    postPages = fs
      .readdirSync(postsDir)
      .filter((f) => f.endsWith(".md"))
      .map((filename) => {
        const slug = filename.replace(/\.md$/, "");
        const filePath = path.join(postsDir, filename);
        const stat = fs.statSync(filePath);

        return {
          url: `${BASE_URL}/posts/${slug}`,
          lastModified: stat.mtime,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        };
      });
  }

  return [...staticPages, ...postPages];
}
