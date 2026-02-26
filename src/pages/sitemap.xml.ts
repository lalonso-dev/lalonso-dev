import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const staticRoutes = [
  "/",
  "/sobre-mi",
  "/proyectos",
  "/blog",
  "/servicios",
  "/contacto",
  "/success",
  "/newsletter-success",
];

const toIsoDate = (value?: Date) =>
  value ? new Date(value).toISOString().split("T")[0] : undefined;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site ?? new URL("https://lalonso.dev");

  const [posts, projects] = await Promise.all([
    getCollection("blog", ({ data }) => !data.draft),
    getCollection("projects"),
  ]);

  const urls: Array<{ loc: string; lastmod?: string }> = [
    ...staticRoutes.map((path) => ({
      loc: new URL(path, siteUrl).toString(),
    })),
    ...posts.map((post) => ({
      loc: new URL(`/blog/${post.slug}`, siteUrl).toString(),
      lastmod: toIsoDate(post.data.date),
    })),
    ...projects.map((project) => ({
      loc: new URL(`/proyectos/${project.slug}`, siteUrl).toString(),
      lastmod: toIsoDate(project.data.date),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `<url>
  <loc>${item.loc}</loc>
  ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ""}
</url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
