import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bold, Italic, Heading1, Heading2, Image, Youtube, Link, X } from 'lucide-react';
import { BlogPost, BlogCategory, BlogTag } from '@/hooks/useBlogData';

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
  const [content, setContent] = useState(post?.content || { blocks: [] });
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

  const editorRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title is required');
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
        content,
        excerpt,
        category_id: categoryId || null,
        featured_image_url: featuredImage || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        keywords: keywords.length > 0 ? keywords : null,
        status,
        published_at: status === 'published' && !post?.published_at ? new Date().toISOString() : post?.published_at,
        reading_time_minutes: calculateReadingTime(content)
      };

      await onSave(postData);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingTime = (content: any) => {
    const text = JSON.stringify(content);
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

  const insertBlock = (type: string) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      data: getDefaultBlockData(type)
    };

    setContent(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
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
        return { url: '', text: '' };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, data: any) => {
    setContent(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, data } : block
      )
    }));
  };

  const removeBlock = (blockId: string) => {
    setContent(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId)
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

          {/* Content Editor */}
          <div>
            <Label>Content</Label>
            <div className="border rounded-lg p-4 space-y-4">
              {/* Editor Toolbar */}
              <div className="flex flex-wrap gap-2 pb-2 border-b">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('header')}
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('paragraph')}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('image')}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('youtube')}
                >
                  <Youtube className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertBlock('link')}
                >
                  <Link className="h-4 w-4" />
                </Button>
              </div>

              {/* Content Blocks */}
              <div className="space-y-4" ref={editorRef}>
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
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

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