import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useBlogData, BlogPost } from '@/hooks/useBlogData';
import { supabase } from '@/integrations/supabase/client';
import { X, Upload, File, Trash2 } from 'lucide-react';
import { BlogCategory, BlogTag } from '@/hooks/useBlogData';
import { useAuth } from '@/hooks/useAuth';
import { BlockEditor, Block } from './blocks/BlockEditor';

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
  const [bibliography, setBibliography] = useState(post?.bibliography || '');
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (post?.content?.blocks) {
      return post.content.blocks.map((block: any, index: number) => ({
        ...block,
        order: index
      }));
    }
    if (post?.content?.mainContent) {
      const paragraphs = post.content.mainContent.split('\n\n').filter(p => p.trim());
      return paragraphs.map((paragraph, index) => ({
        id: `para-${index}`,
        type: 'paragraph' as const,
        data: { text: paragraph.trim() },
        order: index
      }));
    }
    return [{ id: '1', type: 'paragraph' as const, data: { text: '' }, order: 0 }];
  });
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfAttachmentUrl, setPdfAttachmentUrl] = useState(post?.pdf_attachment_url || '');
  const [pdfAttachmentName, setPdfAttachmentName] = useState(post?.pdf_attachment_name || '');
  const [featuredImageUploading, setFeaturedImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setFeaturedImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      setFeaturedImage(publicUrl);
      toast({
        title: "Image uploaded",
        description: "Featured image has been uploaded successfully"
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setFeaturedImageUploading(false);
    }
  };

  const handlePdfUpload = async (file: File): Promise<{ path: string; name: string } | null> => {
    if (!user) return null;
    
    setUploadingPdf(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('blog-pdfs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store the storage path, not the public URL
      setPdfAttachmentUrl(filePath);
      setPdfAttachmentName(file.name);
      setPdfFile(null);
      
      toast({
        title: "Success",
        description: "PDF uploaded successfully",
      });

      return { path: filePath, name: file.name };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload PDF",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleRemovePdf = async () => {
    if (pdfAttachmentUrl && user) {
      try {
        const filePath = pdfAttachmentUrl.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('blog-pdfs')
            .remove([filePath]);
        }
      } catch (error) {
        console.error('Error removing PDF:', error);
      }
    }
    
    setPdfAttachmentUrl('');
    setPdfAttachmentName('');
    setPdfFile(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const hasContent = blocks.some(block => {
      if (block.type === 'paragraph' || block.type === 'heading') {
        return block.data.text && block.data.text.trim();
      }
      return block.data.url || block.data.text;
    });

    if (!hasContent) {
      toast({
        title: "Error", 
        description: "Please add some content to your post",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Upload PDF if there's a new file and get the path/name
      let finalPdfUrl = pdfAttachmentUrl;
      let finalPdfName = pdfAttachmentName;
      
      if (pdfFile) {
        const pdfResult = await handlePdfUpload(pdfFile);
        if (pdfResult) {
          finalPdfUrl = pdfResult.path;
          finalPdfName = pdfResult.name;
        }
      }

      const slug = post?.slug || title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim() + '-' + Date.now();

      const allText = blocks
        .map(block => block.data.text || '')
        .join(' ');

      const postData: Partial<BlogPost> = {
        title,
        slug,
        content: { blocks },
        excerpt,
        bibliography,
        category_id: categoryId || null,
        featured_image_url: featuredImage || null,
        meta_title: metaTitle || null,
        meta_description: metaDescription || null,
        keywords: keywords.length > 0 ? keywords : null,
        status,
        published_at: status === 'published' && !post?.published_at ? new Date().toISOString() : post?.published_at,
        reading_time_minutes: Math.max(1, Math.ceil(allText.split(/\s+/).filter(w => w.length > 0).length / 200)),
        pdf_attachment_url: finalPdfUrl || null,
        pdf_attachment_name: finalPdfName || null
      };

      await onSave(postData);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{post ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
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

          <div>
            <Label htmlFor="bibliography">References/Bibliography</Label>
            <Textarea
              id="bibliography"
              value={bibliography}
              onChange={(e) => setBibliography(e.target.value)}
              placeholder="Add your sources, references, and bibliography here...&#10;Example:&#10;1. Smith, J. (2023). African History. New York: Academic Press.&#10;2. https://example.com/article&#10;3. Brown, A. &amp; Wilson, B. (2022). &quot;Cultural Studies&quot;. Journal of History, 45(2), 123-145."
              rows={4}
            />
          </div>

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

          {/* Featured Image Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Image</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload an image to showcase your blog post
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="featured-image-upload">Upload Image</Label>
                <Input
                  id="featured-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  className="cursor-pointer"
                />
              </div>
              
              <div>
                <Label htmlFor="featured-image-url">Or enter image URL</Label>
                <Input
                  id="featured-image-url"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {featuredImage && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <img
                      src={featuredImage}
                      alt="Featured image preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const sibling = target.nextElementSibling as HTMLElement;
                        target.style.display = 'none';
                        if (sibling) sibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground hidden"
                    >
                      Failed to load image
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PDF Attachment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">PDF Attachment</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload a PDF file that readers can download with this article.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {pdfAttachmentUrl ? (
                <div className="border rounded-lg p-4 flex items-center gap-3">
                  <File className="h-5 w-5 text-accent" />
                  <div className="flex-1">
                    <p className="font-medium">{pdfAttachmentName}</p>
                    <p className="text-sm text-muted-foreground">PDF Document</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(pdfAttachmentUrl, '_blank')}
                    >
                      Preview
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePdf}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="pdf-upload">Upload PDF</Label>
                  <div className="mt-2">
                    <Input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type === 'application/pdf') {
                          setPdfFile(file);
                        } else {
                          toast({
                            title: "Error",
                            description: "Please select a valid PDF file",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={uploadingPdf}
                    />
                  </div>
                  {pdfFile && (
                    <div className="mt-2 p-3 border rounded-lg bg-muted">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <span className="text-sm">{pdfFile.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setPdfFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="text-xl text-accent">Content Editor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create your blog post content using blocks. Start writing, add images, videos, quotes, and more.
              </p>
            </CardHeader>
            <CardContent>
              <BlockEditor blocks={blocks} onChange={setBlocks} />
            </CardContent>
          </Card>

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