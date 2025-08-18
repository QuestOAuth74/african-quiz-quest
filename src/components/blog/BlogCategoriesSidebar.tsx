import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useBlogData } from '@/hooks/useBlogData';
import { FolderOpen, Hash } from 'lucide-react';

interface BlogCategoriesSidebarProps {
  currentCategory?: string;
}

export const BlogCategoriesSidebar: React.FC<BlogCategoriesSidebarProps> = ({ 
  currentCategory 
}) => {
  const { categories, posts } = useBlogData();
  const { state } = useSidebar();
  
  // Count posts per category
  const getCategoryPostCount = (categoryId: string) => {
    return posts.filter(post => post.category_id === categoryId && post.status === 'published').length;
  };
  
  const allPostsCount = posts.filter(post => post.status === 'published').length;

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-64"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground">
            {state !== "collapsed" && "Blog Categories"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {/* All Categories */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/blog" 
                    className={`flex items-center gap-3 w-full ${
                      !currentCategory ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'
                    }`}
                    >
                      <FolderOpen className="h-4 w-4 flex-shrink-0" />
                      {state !== "collapsed" && (
                        <>
                          <span className="flex-1">All Categories</span>
                          <Badge variant="secondary" className="text-xs">
                            {allPostsCount}
                          </Badge>
                        </>
                      )}
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {/* Individual Categories */}
              {categories.map((category) => {
                const postCount = getCategoryPostCount(category.id);
                const isActive = currentCategory === category.id;
                
                return (
                  <SidebarMenuItem key={category.id}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={`/blog?category=${category.id}`}
                        className={`flex items-center gap-3 w-full ${
                          isActive ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'
                        }`}
                        >
                          <Hash className="h-4 w-4 flex-shrink-0" />
                          {state !== "collapsed" && (
                            <>
                              <span className="flex-1 truncate">{category.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {postCount}
                              </Badge>
                            </>
                          )}
                        </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};