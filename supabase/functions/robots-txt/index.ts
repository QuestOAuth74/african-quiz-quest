import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      throw error
    }

    // Generate robots.txt content
    const robotsContent = `User-agent: Googlebot
Allow: /
Allow: /blog
Allow: /about
Allow: /privacy
Allow: /forum
Allow: /quiz
Allow: /crossword
Allow: /wheel-of-destiny

User-agent: Bingbot
Allow: /
Allow: /blog
Allow: /about
Allow: /privacy
Allow: /forum
Allow: /quiz
Allow: /crossword
Allow: /wheel-of-destiny

User-agent: Twitterbot
Allow: /
Allow: /blog
Allow: /about
Allow: /privacy

User-agent: facebookexternalhit
Allow: /
Allow: /blog
Allow: /about
Allow: /privacy

# Allow all blog posts
${posts?.map(post => `Allow: /blog/${post.slug}`).join('\n') || ''}

User-agent: *
Allow: /
Allow: /blog
Allow: /about
Allow: /privacy
Allow: /forum
Allow: /quiz
Allow: /crossword
Allow: /wheel-of-destiny

# Disallow admin areas
Disallow: /admin
Disallow: /auth

# Sitemap
Sitemap: ${new URL('/sitemap.xml', req.url).href}

# Crawl delay
Crawl-delay: 1`

    return new Response(robotsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    return new Response('Error generating robots.txt', {
      status: 500,
      headers: corsHeaders,
    })
  }
})