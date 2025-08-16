
-- Allow authors to manage their own blog posts while preserving existing admin and public read policies

-- Authors can view their own posts (drafts and published)
create policy "Authors can view their own blog posts"
on public.blog_posts
for select
to authenticated
using (auth.uid() = author_id);

-- Authors can create their own posts
create policy "Authors can create their own blog posts"
on public.blog_posts
for insert
to authenticated
with check (auth.uid() = author_id);

-- Authors can update their own posts
create policy "Authors can update their own blog posts"
on public.blog_posts
for update
to authenticated
using (auth.uid() = author_id);

-- Authors can delete their own posts
create policy "Authors can delete their own blog posts"
on public.blog_posts
for delete
to authenticated
using (auth.uid() = author_id);
