import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    status: z.enum(["live", "development", "completed"]),
    featured: z.boolean().default(false),
    date: z.date(),
    cover: z.string(),
    gallery: z.array(z.string()).optional(),
    technologies: z.array(z.string()),
    liveUrl: z.string().url().optional(),
    githubUrl: z.string().url().optional(),
    client: z.string().optional(),
    externalProject: z.boolean().default(false),
    testimonial: z
      .object({
        text: z.string(),
        author: z.string(),
        role: z.string(),
        rating: z.number().min(1).max(5),
      })
      .optional(),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    cover: z.string().optional(),
    categories: z.array(z.string()),
    readingTime: z.number().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { projects, blog };
