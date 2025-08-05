
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type DeleteBlogPostInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteBlogPost = async (input: DeleteBlogPostInput): Promise<{ success: boolean }> => {
  try {
    // Delete the blog post by ID
    const result = await db.delete(blogPostsTable)
      .where(eq(blogPostsTable.id, input.id))
      .returning()
      .execute();

    // Check if any rows were deleted
    if (result.length === 0) {
      throw new Error(`Blog post with ID ${input.id} not found`);
    }

    return { success: true };
  } catch (error) {
    console.error('Blog post deletion failed:', error);
    throw error;
  }
};
