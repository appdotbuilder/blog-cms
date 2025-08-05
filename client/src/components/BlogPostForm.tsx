
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import { CalendarIcon, TagIcon, XIcon, SaveIcon, EyeIcon } from 'lucide-react';
import type { CreateBlogPostInput, UpdateBlogPostInput, BlogPost } from '../../../server/src/schema';

interface BlogPostFormProps {
  onCreateSubmit?: (data: CreateBlogPostInput) => Promise<void>;
  onUpdateSubmit?: (data: UpdateBlogPostInput) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  initialData?: BlogPost | null;
}

export function BlogPostForm({ onCreateSubmit, onUpdateSubmit, onCancel, isLoading = false, initialData }: BlogPostFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    body: initialData?.body || '',
    author: initialData?.author || '',
    publication_date: initialData?.publication_date || new Date(),
    tags: initialData?.tags || []
  });

  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData && onUpdateSubmit) {
      const updateData: UpdateBlogPostInput = {
        id: initialData.id,
        title: formData.title,
        body: formData.body,
        author: formData.author,
        publication_date: formData.publication_date,
        tags: formData.tags
      };
      await onUpdateSubmit(updateData);
    } else if (onCreateSubmit) {
      const createData: CreateBlogPostInput = {
        title: formData.title,
        body: formData.body,
        author: formData.author,
        publication_date: formData.publication_date,
        tags: formData.tags
      };
      await onCreateSubmit(createData);
    }
    
    // Reset form if creating new post
    if (!initialData) {
      setFormData({
        title: '',
        body: '',
        author: '',
        publication_date: new Date(),
        tags: []
      });
      setTagInput('');
    }
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const renderMarkdownPreview = (markdown: string) => {
    // Simple markdown-to-HTML conversion for preview
    return markdown
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter blog post title..."
          required
          className="text-lg"
        />
      </div>

      {/* Author and Publication Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="author" className="text-sm font-medium">Author *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ ...prev, author: e.target.value }))
            }
            placeholder="Author name..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="publication_date" className="text-sm font-medium flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Publication Date *
          </Label>
          <Input
            id="publication_date"
            type="date"
            value={formatDateForInput(formData.publication_date)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData((prev) => ({ 
                ...prev, 
                publication_date: new Date(e.target.value) 
              }))
            }
            required
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <TagIcon className="h-4 w-4" />
          Tags
        </Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            placeholder="Add a tag and press Enter..."
            className="flex-1"
          />
          <Button type="button" onClick={addTag} variant="outline" size="sm">
            Add Tag
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="body" className="text-sm font-medium">Content (Markdown) *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <EyeIcon className="h-4 w-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
        
        <div className={`grid gap-4 ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, body: e.target.value }))
              }
              placeholder="Write your blog post content in Markdown format...

Example:
# Main Heading
## Sub Heading
**Bold text** and *italic text*
`inline code`

- List item 1
- List item 2"
              required
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
          
          {showPreview && (
            <Card className="h-fit">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-sm text-slate-600">Preview:</h4>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: `<p class="mb-4">${renderMarkdownPreview(formData.body)}</p>` 
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <SaveIcon className="h-4 w-4" />
          {isLoading ? 'Saving...' : (initialData ? 'Update Post' : 'Create Post')}
        </Button>
        
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
