
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type DeleteBlogPostInput, type CreateBlogPostInput } from '../schema';
import { deleteBlogPost } from '../handlers/delete_blog_post';
import { eq } from 'drizzle-orm';

// Test input for creating a blog post to delete
const testCreateInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  body: 'This is a test blog post content with **markdown**.',
  author: 'Test Author',
  publication_date: new Date('2024-01-15'),
  tags: ['test', 'blog', 'delete']
};

// Helper function to create a blog post directly in tests
const createTestBlogPost = async (input: CreateBlogPostInput) => {
  const result = await db.insert(blogPostsTable)
    .values({
      title: input.title,
      body: input.body,
      author: input.author,
      publication_date: input.publication_date,
      tags: input.tags
    })
    .returning()
    .execute();

  return result[0];
};

describe('deleteBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing blog post', async () => {
    // First create a blog post to delete
    const createdPost = await createTestBlogPost(testCreateInput);
    
    const deleteInput: DeleteBlogPostInput = {
      id: createdPost.id
    };

    const result = await deleteBlogPost(deleteInput);

    // Should return success
    expect(result.success).toBe(true);

    // Verify the blog post was actually deleted from database
    const posts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, createdPost.id))
      .execute();

    expect(posts).toHaveLength(0);
  });

  it('should throw error when blog post does not exist', async () => {
    const deleteInput: DeleteBlogPostInput = {
      id: 999999 // Non-existent ID
    };

    await expect(deleteBlogPost(deleteInput))
      .rejects.toThrow(/blog post with id 999999 not found/i);
  });

  it('should not affect other blog posts when deleting one', async () => {
    // Create two blog posts
    const post1 = await createTestBlogPost(testCreateInput);
    const post2 = await createTestBlogPost({
      ...testCreateInput,
      title: 'Second Test Post',
      author: 'Another Author'
    });

    // Delete the first post
    const deleteInput: DeleteBlogPostInput = {
      id: post1.id
    };

    const result = await deleteBlogPost(deleteInput);
    expect(result.success).toBe(true);

    // Verify first post is deleted
    const deletedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, post1.id))
      .execute();
    expect(deletedPost).toHaveLength(0);

    // Verify second post still exists
    const remainingPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, post2.id))
      .execute();
    expect(remainingPost).toHaveLength(1);
    expect(remainingPost[0].title).toEqual('Second Test Post');
  });
});
