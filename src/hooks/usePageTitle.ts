import { useEffect } from "react";

interface UsePageTitleOptions {
  loading?: boolean;
  loadingTitle?: string;
}

export const usePageTitle = (title: string, options: UsePageTitleOptions = {}) => {
  const { loading = false, loadingTitle = "Loading..." } = options;
  
  useEffect(() => {
    const finalTitle = loading ? `${loadingTitle} - Historia Africana` : `${title} - Historia Africana`;
    document.title = finalTitle;
    
    // Set meta description if not already set
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    
    // Set default description if none provided
    if (!metaDescription.getAttribute('content') || metaDescription.getAttribute('content') === 'Test your knowledge of African history in this exciting Jeopardy-style quiz game') {
      metaDescription.setAttribute('content', 'Historia Africana - Discover the rich history and heritage of Africa through interactive games, quizzes, and educational content.');
    }
  }, [title, loading, loadingTitle]);
};

export const usePageMeta = (title: string, description?: string, options: UsePageTitleOptions = {}) => {
  const { loading = false, loadingTitle = "Loading..." } = options;
  
  useEffect(() => {
    const finalTitle = loading ? `${loadingTitle} - Historia Africana` : `${title} - Historia Africana`;
    document.title = finalTitle;
    
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description, loading, loadingTitle]);
};