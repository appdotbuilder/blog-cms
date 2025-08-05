
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { type CreateBlogPostInput } from '../schema';
import { createBlogPost } from '../handlers/create_blog_post';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateBlogPostInput = {
  title: 'Test Blog Post',
  body: '# Test Content\n\nThis is a test blog post with **markdown** content.',
  author: 'Test Author',
  publication_date: new Date('2024-01-15'),
  tags: ['test', 'blog', 'markdown']
};

describe('createBlogPost', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a blog post', async () => {
    const result = await createBlogPost(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Blog Post');
    expect(result.body).toEqual(testInput.body);
    expect(result.author).toEqual('Test Author');
    expect(result.publication_date).toEqual(testInput.publication_date);
    expect(result.tags).toEqual(['test', 'blog', 'markdown']);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save blog post to database', async () => {
    const result = await createBlogPost(testInput);

    // Query using proper drizzle syntax
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts).toHaveLength(1);
    expect(blogPosts[0].title).toEqual('Test Blog Post');
    expect(blogPosts[0].body).toEqual(testInput.body);
    expect(blogPosts[0].author).toEqual('Test Author');
    expect(blogPosts[0].publication_date).toEqual(testInput.publication_date);
    expect(blogPosts[0].tags).toEqual(['test', 'blog', 'markdown']);
    expect(blogPosts[0].created_at).toBeInstanceOf(Date);
    expect(blogPosts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty tags array', async () => {
    const inputWithEmptyTags: CreateBlogPostInput = {
      ...testInput,
      tags: []
    };

    const result = await createBlogPost(inputWithEmptyTags);

    expect(result.tags).toEqual([]);

    // Verify in database
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts[0].tags).toEqual([]);
  });

  it('should handle markdown content correctly', async () => {
    const markdownInput: CreateBlogPostInput = {
      title: 'Markdown Test',
      body: '# Heading 1\n\n## Heading 2\n\n- List item 1\n- List item 2\n\n**Bold text** and *italic text*\n\n```javascript\nconsole.log("code block");\n```',
      author: 'Markdown Author',
      publication_date: new Date('2024-02-01'),
      tags: ['markdown', 'formatting']
    };

    const result = await createBlogPost(markdownInput);

    expect(result.body).toEqual(markdownInput.body);

    // Verify markdown content is preserved in database
    const blogPosts = await db.select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.id, result.id))
      .execute();

    expect(blogPosts[0].body).toEqual(markdownInput.body);
    expect(blogPosts[0].body).toContain('# Heading 1');
    expect(blogPosts[0].body).toContain('**Bold text**');
    expect(blogPosts[0].body).toContain('```javascript');
  });
});
