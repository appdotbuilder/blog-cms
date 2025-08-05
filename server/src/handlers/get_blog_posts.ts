
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type BlogPost } from '../schema';
import { desc } from 'drizzle-orm';

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const results = await db.select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.publication_date))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    throw error;
  }
}
