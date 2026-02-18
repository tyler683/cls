
import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = "landscaping Kansas City, Missouri outdoor contractor, KC hardscaping, custom patios MO, retaining walls Kansas City, grading and drainage KC, professional landscapers Missouri, Creative Landscaping Solutions, yard renovation KC", 
  image = "https://res.cloudinary.com/clsllc/image/upload/v1764997675/Stonehenge2007_07_30_fstn2v.jpg" 
}) => {
  useEffect(() => {
    const siteName = "Creative Landscaping Solutions";
    const fullTitle = `${title} | ${siteName}`;
    const primaryDomain = "https://creativelandscapingsolutions.com";
    
    // Update Title
    document.title = fullTitle;

    // Helper to update meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update Standard Meta Tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);

    // Update Open Graph (Facebook/Social)
    updateMeta('og:title', fullTitle, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', image, 'property');
    updateMeta('og:url', primaryDomain + window.location.pathname, 'property');

    // Update Twitter Cards
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // Canonical Link handling
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', primaryDomain + window.location.pathname);

  }, [title, description, keywords, image]);

  return null;
};

export default SEO;
