
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, UserIcon, TagIcon } from 'lucide-react';
import type { BlogPost } from '../../../server/src/schema';

interface BlogPostPreviewProps {
  post: BlogPost;
  isOpen: boolean;
  onClose: () => void;
}

export function BlogPostPreview({ post, isOpen, onClose }: BlogPostPreviewProps) {
  const renderMarkdown = (markdown: string) => {
    // Enhanced markdown-to-HTML conversion for better preview
    let html = markdown
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3 text-slate-800">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-slate-800">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-slate-900">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4 text-slate-700 leading-relaxed">')
      .replace(/\n/g, '<br/>');

    // Wrap list items
    html = html.replace(/(<li.*<\/li>)/g, '<ul class="list-disc ml-6 mb-4 space-y-1">$1</ul>');
    
    return html;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
            {post.title}
          </DialogTitle>
          
          {/* Post metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-3">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{post.publication_date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <TagIcon className="h-4 w-4 text-slate-500" />
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <article 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: `<p class="mb-4 text-slate-700 leading-relaxed">${renderMarkdown(post.body)}</p>` 
              }}
            />
          </div>
        </ScrollArea>

        {/* Footer with metadata */}
        <div className="border-t p-4 bg-slate-50 text-xs text-slate-500">
          <div className="flex justify-between items-center">
            <span>Created: {post.created_at.toLocaleDateString()}</span>
            <span>Last updated: {post.updated_at.toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
