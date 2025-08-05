
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BlogPostForm } from '@/components/BlogPostForm';
import { BlogPostPreview } from '@/components/BlogPostPreview';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { PenIcon, TrashIcon, EyeIcon, PlusIcon, CalendarIcon, UserIcon, TagIcon } from 'lucide-react';
import type { BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from '../../server/src/schema';

function App() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const loadBlogPosts = useCallback(async () => {
    try {
      const result = await trpc.getBlogPosts.query();
      setBlogPosts(result);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    }
  }, []);

  useEffect(() => {
    loadBlogPosts();
  }, [loadBlogPosts]);

  const handleCreatePost = async (data: CreateBlogPostInput) => {
    setIsLoading(true);
    try {
      const response = await trpc.createBlogPost.mutate(data);
      setBlogPosts((prev: BlogPost[]) => [response, ...prev]);
      setActiveTab('list');
    } catch (error) {
      console.error('Failed to create blog post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = async (data: UpdateBlogPostInput) => {
    setIsLoading(true);
    try {
      const response = await trpc.updateBlogPost.mutate(data);
      setBlogPosts((prev: BlogPost[]) => 
        prev.map((post: BlogPost) => post.id === response.id ? response : post)
      );
      setEditingPost(null);
      setActiveTab('list');
    } catch (error) {
      console.error('Failed to update blog post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id: number) => {
    try {
      await trpc.deleteBlogPost.mutate({ id });
      setBlogPosts((prev: BlogPost[]) => prev.filter((post: BlogPost) => post.id !== id));
    } catch (error) {
      console.error('Failed to delete blog post:', error);
    }
  };

  const startEditing = (post: BlogPost) => {
    setEditingPost(post);
    setActiveTab('create');
  };

  const cancelEditing = () => {
    setEditingPost(null);
    setActiveTab('list');
  };

  const showPreview = (post: BlogPost) => {
    setPreviewPost(post);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">📝 Blog CMS</h1>
          <p className="text-slate-600">Manage your blog posts with ease</p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="list" className="flex items-center gap-2">
              📚 Posts ({blogPosts.length})
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              {editingPost ? 'Edit' : 'Create'}
            </TabsTrigger>
          </TabsList>

          {/* Blog Posts List */}
          <TabsContent value="list" className="space-y-6">
            {blogPosts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">📰</div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No blog posts yet</h3>
                  <p className="text-slate-500 mb-4">Create your first blog post to get started!</p>
                  <Button onClick={() => setActiveTab('create')} className="bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create First Post
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {blogPosts.map((post: BlogPost) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">
                            {post.title}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-4 w-4" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-4 w-4" />
                              {post.publication_date.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => showPreview(post)}
                            className="hover:bg-blue-50"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(post)}
                            className="hover:bg-green-50"
                          >
                            <PenIcon className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="hover:bg-red-50 text-red-600">
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{post.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {post.body.replace(/[#*`]/g, '').substring(0, 200)}{post.body.length > 200 ? '...' : ''}
                      </p>
                      
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <TagIcon className="h-4 w-4 text-slate-500" />
                          {post.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t text-xs text-slate-400">
                        Created: {post.created_at.toLocaleDateString()} • 
                        Last updated: {post.updated_at.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Create/Edit Form */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {editingPost ? (
                    <>
                      <PenIcon className="h-5 w-5" />
                      Edit Blog Post
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5" />
                      Create New Blog Post
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BlogPostForm
                  onCreateSubmit={!editingPost ? handleCreatePost : undefined}
                  onUpdateSubmit={editingPost ? handleUpdatePost : undefined}
                  onCancel={editingPost ? cancelEditing : undefined}
                  isLoading={isLoading}
                  initialData={editingPost}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        {previewPost && (
          <BlogPostPreview
            post={previewPost}
            isOpen={!!previewPost}
            onClose={() => setPreviewPost(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
