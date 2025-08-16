import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bold, Italic, Heading1, Heading2, Image, Youtube, Link, X, Upload, File } from 'lucide-react';
import { BlogPost, BlogCategory, BlogTag } from '@/hooks/useBlogData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BlogEditorProps {
  post?: BlogPost;
  categories: BlogCategory[];
  tags: BlogTag[];
  onSave: (postData: Partial<BlogPost>) => Promise<void>;
  onCancel: () => void;
}

export const BlogEditor: React.FC<BlogEditorProps> = ({
  post,
  categories,
  tags,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [mainContent, setMainContent] = useState(post?.content?.mainContent || '');
  const [content, setContent] = useState(post?.content || { mainContent: '', blocks: [] });
  const [categoryId, setCategoryId] = useState(post?.category_id || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.tags?.map(tag => tag.id) || []
  );
  const [featuredImage, setFeaturedImage] = useState(post?.featured_image_url || '');
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '');
  const [keywords, setKeywords] = useState<string[]>(post?.keywords || []);
  const [keywordInput, setKeywordInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    (post?.status as 'draft' | 'published' | 'archived') || 'draft'
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!mainContent.trim()) {
      toast({
        title: "Error", 
        description: "Main content body is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const slug = post?.slug || title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim() + '-' + Date.now();

      const postData: Partial<BlogPost> = {
        title,
        slug,
        content: {
          mainContent,
          blocks: content.blocks || []
        },
        excerpt,
        category_id: categoryId || null,
        featured_image_url: featuredImage || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        keywords: keywords.length > 0 ? keywords : null,
        status,
        published_at: status === 'published' && !post?.published_at ? new Date().toISOString() : post?.published_at,
        reading_time_minutes: calculateReadingTime(mainContent + JSON.stringify(content.blocks))
      };

      await onSave(postData);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingTime = (text: string) => {
    const wordCount = text.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `blog-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('forum-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('forum-images')
        .getPublicUrl(filePath);

      const fileUrl = data.publicUrl;

      // Insert file link block
      const newBlock = {
        id: Date.now().toString(),
        type: 'file',
        data: {
          url: fileUrl,
          name: file.name,
          type: file.type
        }
      };

      setContent(prev => ({
        ...prev,
        blocks: [...(prev.blocks || []), newBlock]
      }));

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const insertBlock = (type: string) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      data: getDefaultBlockData(type)
    };

    setContent(prev => ({
      ...prev,
      blocks: [...(prev.blocks || []), newBlock]
    }));
  };

  const getDefaultBlockData = (type: string) => {
    switch (type) {
      case 'header':
        return { text: '', level: 2 };
      case 'paragraph':
        return { text: '' };
      case 'image':
        return { url: '', caption: '' };
      case 'youtube':
        return { url: '', caption: '' };
      case 'link':
        return { url: '', text: '', description: '' };
      case 'file':
        return { url: '', name: '', type: '' };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, data: any) => {
    setContent(prev => ({
      ...prev,
      blocks: (prev.blocks || []).map(block =>
        block.id === blockId ? { ...block, data } : block
      )
    }));
  };

  const removeBlock = (blockId: string) => {
    setContent(prev => ({
      ...prev,
      blocks: (prev.blocks || []).filter(block => block.id !== blockId)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{post ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as 'draft' | 'published' | 'archived')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief description of the post"
              rows={3}
            />
          </div>

          {/* Category and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <Label htmlFor="featured-image">Featured Image URL</Label>
            <Input
              id="featured-image"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* MAIN CONTENT BODY */}
          <Card className="border-2 border-theme-gold/20">
            <CardHeader>
              <CardTitle className="text-xl text-theme-gold">Main Content Body *</CardTitle>
              <p className="text-sm text-muted-foreground">
                Write the main content of your blog post here. This is the primary text that readers will see.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={mainContent}
                onChange={(e) => setMainContent(e.target.value)}
                placeholder="Write your main blog post content here..."
                className="min-h-[200px] text-base leading-relaxed"
                rows={10}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Word count: {mainContent.split(/\s+/).filter(word => word.length > 0).length} words
              </p>
            </CardContent>
          </Card>

          {/* Additional Content Blocks */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Content Elements (Optional)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add images, videos, links, and files to enhance your blog post
              </p>
            </CardHeader>
            <CardContent>
              {/* Toolbar */}
              <div className="flex flex-wrap gap-2 pb-4 border-b mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('header')}
                >
                  <Heading1 className="h-4 w-4 mr-2" />
                  Heading
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('paragraph')}
                >
                  <Bold className="h-4 w-4 mr-2" />
                  Paragraph
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('image')}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('youtube')}
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  YouTube
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('link')}
                >
                  <Link className="h-4 w-4 mr-2" />
                  Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
              </div>

              {/* Content Blocks */}
              <div className="space-y-4">
                {content.blocks?.map((block: any) => (
                  <div key={block.id} className="border rounded p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{block.type}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlock(block.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {block.type === 'header' && (
                      <div className="space-y-2">
                        <Select
                          value={block.data.level?.toString()}
                          onValueChange={(value) => updateBlock(block.id, { ...block.data, level: parseInt(value) })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">H1</SelectItem>
                            <SelectItem value="2">H2</SelectItem>
                            <SelectItem value="3">H3</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={block.data.text}
                          onChange={(e) => updateBlock(block.id, { ...block.data, text: e.target.value })}
                          placeholder="Heading text"
                        />
                      </div>
                    )}

                    {block.type === 'paragraph' && (
                      <Textarea
                        value={block.data.text}
                        onChange={(e) => updateBlock(block.id, { ...block.data, text: e.target.value })}
                        placeholder="Paragraph content"
                        rows={4}
                      />
                    )}

                    {block.type === 'image' && (
                      <div className="space-y-2">
                        <Input
                          value={block.data.url}
                          onChange={(e) => updateBlock(block.id, { ...block.data, url: e.target.value })}
                          placeholder="Image URL"
                        />
                        <Input
                          value={block.data.caption}
                          onChange={(e) => updateBlock(block.id, { ...block.data, caption: e.target.value })}
                          placeholder="Image caption"
                        />
                      </div>
                    )}

                    {block.type === 'youtube' && (
                      <div className="space-y-2">
                        <Input
                          value={block.data.url}
                          onChange={(e) => updateBlock(block.id, { ...block.data, url: e.target.value })}
                          placeholder="YouTube URL"
                        />
                        <Input
                          value={block.data.caption}
                          onChange={(e) => updateBlock(block.id, { ...block.data, caption: e.target.value })}
                          placeholder="Video caption"
                        />
                      </div>
                    )}

                    {block.type === 'link' && (
                      <div className="space-y-2">
                        <Input
                          value={block.data.url}
                          onChange={(e) => updateBlock(block.id, { ...block.data, url: e.target.value })}
                          placeholder="Link URL"
                        />
                        <Input
                          value={block.data.text}
                          onChange={(e) => updateBlock(block.id, { ...block.data, text: e.target.value })}
                          placeholder="Link text"
                        />
                        <Input
                          value={block.data.description}
                          onChange={(e) => updateBlock(block.id, { ...block.data, description: e.target.value })}
                          placeholder="Link description (optional)"
                        />
                      </div>
                    )}

                    {block.type === 'file' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          <File className="h-4 w-4" />
                          <span className="text-sm">{block.data.name}</span>
                          <a 
                            href={block.data.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-theme-gold text-sm hover:underline ml-auto"
                          >
                            View File
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {(!content.blocks || content.blocks.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No additional content elements added yet. Use the buttons above to add images, videos, links, or files.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title (60 characters max)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="SEO description (160 characters max)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Add keyword"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" onClick={addKeyword}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywords.map(keyword => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => removeKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Post'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};