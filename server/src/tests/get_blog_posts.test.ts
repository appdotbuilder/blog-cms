
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { blogPostsTable } from '../db/schema';
import { getBlogPosts } from '../handlers/get_blog_posts';

describe('getBlogPosts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no blog posts exist', async () => {
    const result = await getBlogPosts();
    expect(result).toEqual([]);
  });

  it('should return all blog posts', async () => {
    // Create test blog posts
    await db.insert(blogPostsTable).values([
      {
        title: 'First Post',
        body: 'This is the first blog post',
        author: 'John Doe',
        publication_date: new Date('2024-01-01'),
        tags: ['tech', 'javascript']
      },
      {
        title: 'Second Post',
        body: 'This is the second blog post',
        author: 'Jane Smith',
        publication_date: new Date('2024-01-02'),
        tags: ['web', 'frontend']
      }
    ]).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(2);
    
    // Since results are ordered by publication_date DESC, "Second Post" (2024-01-02) comes first
    expect(result[0].title).toEqual('Second Post');
    expect(result[0].body).toEqual('This is the second blog post');
    expect(result[0].author).toEqual('Jane Smith');
    expect(result[0].publication_date).toEqual(new Date('2024-01-02'));
    expect(result[0].tags).toEqual(['web', 'frontend']);
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);

    // "First Post" (2024-01-01) comes second
    expect(result[1].title).toEqual('First Post');
    expect(result[1].author).toEqual('John Doe');
  });

  it('should return blog posts ordered by publication_date in descending order', async () => {
    // Create blog posts with different publication dates
    await db.insert(blogPostsTable).values([
      {
        title: 'Oldest Post',
        body: 'This is the oldest post',
        author: 'Author A',
        publication_date: new Date('2024-01-01'),
        tags: ['old']
      },
      {
        title: 'Newest Post',
        body: 'This is the newest post',
        author: 'Author B',
        publication_date: new Date('2024-01-03'),
        tags: ['new']
      },
      {
        title: 'Middle Post',
        body: 'This is a middle post',
        author: 'Author C',
        publication_date: new Date('2024-01-02'),
        tags: ['middle']
      }
    ]).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(3);
    
    // Should be ordered by publication_date DESC (newest first)
    expect(result[0].title).toEqual('Newest Post');
    expect(result[0].publication_date).toEqual(new Date('2024-01-03'));
    
    expect(result[1].title).toEqual('Middle Post');
    expect(result[1].publication_date).toEqual(new Date('2024-01-02'));
    
    expect(result[2].title).toEqual('Oldest Post');
    expect(result[2].publication_date).toEqual(new Date('2024-01-01'));
  });

  it('should handle blog posts with empty tags array', async () => {
    await db.insert(blogPostsTable).values({
      title: 'Post Without Tags',
      body: 'This post has no tags',
      author: 'No Tags Author',
      publication_date: new Date('2024-01-01'),
      tags: [] // Empty tags array
    }).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    expect(result[0].tags).toEqual([]);
  });

  it('should handle blog posts with multiple tags', async () => {
    await db.insert(blogPostsTable).values({
      title: 'Multi-tag Post',
      body: 'This post has many tags',
      author: 'Tag Lover',
      publication_date: new Date('2024-01-01'),
      tags: ['tech', 'web', 'javascript', 'frontend', 'backend']
    }).execute();

    const result = await getBlogPosts();

    expect(result).toHaveLength(1);
    expect(result[0].tags).toEqual(['tech', 'web', 'javascript', 'frontend', 'backend']);
    expect(result[0].tags).toHaveLength(5);
  });
});
