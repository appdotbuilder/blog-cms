
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type UpdateBlogPostInput, type CreateBlogPostInput } from '../schema';
import { updateBlogPost } from '../handlers/update_blog_post';
import { eq } from 'drizzle-orm';

// Helper function to create a test blog post
const createTestBlogPost = async (): Promise<number> => {
  const testPost = {
    title: 'Original Title',
    body: 'Original body content',
    author: 'Original Author',
    publication_date: new Date('2024-01-01'),
    tags: ['original', 'test']
  };

  const result = await db.insert(blogPostsTable)
    .values(testPost)
    .returning()
    .execute();

  return result[0].id;
};

describe('updateBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a blog post', async () => {
    const blogPostId = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      title: 'Updated Title',
      body: 'Updated body content',
      author: 'Updated Author',
      publication_date: new Date('2024-02-01'),
      tags: ['updated', 'modified']
    };

    const result = await updateBlogPost(updateInput);

    expect(result.id).toEqual(blogPostId);
    expect(result.title).toEqual('Updated Title');
    expect(result.body).toEqual('Updated body content');
    expect(result.author).toEqual('Updated Author');
    expect(result.publication_date).toEqual(new Date('2024-02-01'));
    expect(result.tags).toEqual(['updated', 'modified']);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should update partial fields of a blog post', async () => {
    const blogPostId = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      title: 'Partially Updated Title',
      tags: ['partial', 'update']
    };

    const result = await updateBlogPost(updateInput);

    expect(result.id).toEqual(blogPostId);
    expect(result.title).toEqual('Partially Updated Title');
    expect(result.body).toEqual('Original body content'); // Should remain unchanged
    expect(result.author).toEqual('Original Author'); // Should remain unchanged
    expect(result.publication_date).toEqual(new Date('2024-01-01')); // Should remain unchanged
    expect(result.tags).toEqual(['partial', 'update']);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should update the updated_at timestamp', async () => {
    const blogPostId = await createTestBlogPost();

    // Get the original updated_at timestamp
    const originalPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogPostId))
      .execute();

    const originalUpdatedAt = originalPost[0].updated_at;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      title: 'Updated Title'
    };

    const result = await updateBlogPost(updateInput);

    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should persist changes to the database', async () => {
    const blogPostId = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      title: 'Database Updated Title',
      body: 'Database updated content'
    };

    await updateBlogPost(updateInput);

    // Verify changes were persisted
    const updatedPost = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, blogPostId))
      .execute();

    expect(updatedPost).toHaveLength(1);
    expect(updatedPost[0].title).toEqual('Database Updated Title');
    expect(updatedPost[0].body).toEqual('Database updated content');
    expect(updatedPost[0].author).toEqual('Original Author'); // Unchanged
    expect(updatedPost[0].updated_at).toBeInstanceOf(Date);
  });

  it('should throw error when blog post does not exist', async () => {
    const updateInput: UpdateBlogPostInput = {
      id: 999999, // Non-existent ID
      title: 'Updated Title'
    };

    await expect(updateBlogPost(updateInput))
      .rejects
      .toThrow(/Blog post with id 999999 not found/i);
  });

  it('should handle empty tags array update', async () => {
    const blogPostId = await createTestBlogPost();

    const updateInput: UpdateBlogPostInput = {
      id: blogPostId,
      tags: []
    };

    const result = await updateBlogPost(updateInput);

    expect(result.tags).toEqual([]);
    expect(result.title).toEqual('Original Title'); // Should remain unchanged
  });
});
