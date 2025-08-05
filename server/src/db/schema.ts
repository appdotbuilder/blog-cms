
import { serial, text, pgTable, timestamp, json } from 'drizzle-orm/pg-core';

export const blogPostsTable = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(), // Markdown content stored as text
  author: text('author').notNull(),
  publication_date: timestamp('publication_date').notNull(),
  tags: json('tags').$type<string[]>().notNull().default([]), // JSON array of strings for tags
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type BlogPost = typeof blogPostsTable.$inferSelect; // For SELECT operations
export type NewBlogPost = typeof blogPostsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { blogPosts: blogPostsTable };
