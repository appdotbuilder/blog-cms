
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type BlogPost } from '../schema';
import { eq } from 'drizzle-orm';

export const updateBlogPost = async (input: UpdateBlogPostInput): Promise<BlogPost> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof blogPostsTable.$inferInsert> = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    
    if (input.body !== undefined) {
      updateData.body = input.body;
    }
    
    if (input.author !== undefined) {
      updateData.author = input.author;
    }
    
    if (input.publication_date !== undefined) {
      updateData.publication_date = input.publication_date;
    }
    
    if (input.tags !== undefined) {
      updateData.tags = input.tags;
    }

    // Update the blog post and return the updated record
    const result = await db.update(blogPostsTable)
      .set(updateData)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    // Check if blog post was found and updated
    if (result.length === 0) {
      throw new Error(`Blog post with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Blog post update failed:', error);
    throw error;
  }
};
