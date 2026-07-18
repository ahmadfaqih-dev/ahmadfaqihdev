import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.coerce.date(),
    image:       z.string(),
    category:    z.string(),
    tags:        z.array(z.string()),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.coerce.date(),
    image:       z.string(),
    number:      z.string(),
    badge:       z.string().optional(),
  }),
});

export const collections = { blog, projects };
