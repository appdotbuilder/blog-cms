
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const getBlogPost = async (input: GetBlogPostInput): Promise<BlogPost | null> => {
  try {
    const result = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      return null;
    }

    const blogPost = result[0];
    return {
      ...blogPost,
      tags: blogPost.tags || [] // Ensure tags is always an array
    };
  } catch (error) {
    console.error('Blog post retrieval failed:', error);
    throw error;
  }
};
