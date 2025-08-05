
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type GetBlogPostInput } from '../schema';
import { getBlogPost } from '../handlers/get_blog_post';

describe('getBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a blog post when found', async () => {
    // Create test blog post
    const testBlogPost = await db.insert(blogPostsTable)
      .values({
        title: 'Test Blog Post',
        body: '# Test Content\n\nThis is test markdown content.',
        author: 'Test Author',
        publication_date: new Date('2024-01-01'),
        tags: ['test', 'example']
      })
      .returning()
      .execute();

    const input: GetBlogPostInput = {
      id: testBlogPost[0].id
    };

    const result = await getBlogPost(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(testBlogPost[0].id);
    expect(result!.title).toEqual('Test Blog Post');
    expect(result!.body).toEqual('# Test Content\n\nThis is test markdown content.');
    expect(result!.author).toEqual('Test Author');
    expect(result!.publication_date).toEqual(new Date('2024-01-01'));
    expect(result!.tags).toEqual(['test', 'example']);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when blog post not found', async () => {
    const input: GetBlogPostInput = {
      id: 999 // Non-existent ID
    };

    const result = await getBlogPost(input);

    expect(result).toBeNull();
  });

  it('should handle blog post with empty tags array', async () => {
    // Create test blog post with empty tags
    const testBlogPost = await db.insert(blogPostsTable)
      .values({
        title: 'Post Without Tags',
        body: 'Content without tags',
        author: 'Test Author',
        publication_date: new Date('2024-01-01'),
        tags: []
      })
      .returning()
      .execute();

    const input: GetBlogPostInput = {
      id: testBlogPost[0].id
    };

    const result = await getBlogPost(input);

    expect(result).not.toBeNull();
    expect(result!.tags).toEqual([]);
    expect(Array.isArray(result!.tags)).toBe(true);
  });

  it('should handle blog post with single tag', async () => {
    // Create test blog post with single tag
    const testBlogPost = await db.insert(blogPostsTable)
      .values({
        title: 'Single Tag Post',
        body: 'Content with one tag',
        author: 'Test Author',
        publication_date: new Date('2024-01-01'),
        tags: ['single']
      })
      .returning()
      .execute();

    const input: GetBlogPostInput = {
      id: testBlogPost[0].id
    };

    const result = await getBlogPost(input);

    expect(result).not.toBeNull();
    expect(result!.tags).toEqual(['single']);
    expect(Array.isArray(result!.tags)).toBe(true);
    expect(result!.tags).toHaveLength(1);
  });
});
