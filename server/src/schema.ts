
import { z } from 'zod';

// Blog post schema
export const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(), // Markdown content
  author: z.string(),
  publication_date: z.coerce.date(),
  tags: z.array(z.string()), // Array of tag strings
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type BlogPost = z.infer<typeof blogPostSchema>;

// Input schema for creating blog posts
export const createBlogPostInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body content is required"),
  author: z.string().min(1, "Author is required"),
  publication_date: z.coerce.date(),
  tags: z.array(z.string()).default([]) // Default to empty array if not provided
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostInputSchema>;

// Input schema for updating blog posts
export const updateBlogPostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  author: z.string().min(1).optional(),
  publication_date: z.coerce.date().optional(),
  tags: z.array(z.string()).optional()
});

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostInputSchema>;

// Schema for getting blog post by ID
export const getBlogPostInputSchema = z.object({
  id: z.number()
});

export type GetBlogPostInput = z.infer<typeof getBlogPostInputSchema>;

// Schema for deleting blog post
export const deleteBlogPostInputSchema = z.object({
  id: z.number()
});

export type DeleteBlogPostInput = z.infer<typeof deleteBlogPostInputSchema>;
