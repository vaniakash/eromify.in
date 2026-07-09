import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

// Enforce static generation at build time for Vercel compatibility and instant loading
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.eromify.in';

  // Core static routes
  const staticRoutes = [
    { path: '',                                  priority: 1.0,  freq: 'daily' },
    { path: '/blog',                             priority: 0.9,  freq: 'daily' },
    { path: '/blog/eromify-alternative',         priority: 0.98, freq: 'weekly' },
    { path: '/pricing',                          priority: 0.95, freq: 'weekly' },
    { path: '/ai-influencer-studio',             priority: 0.9,  freq: 'weekly' },
    { path: '/video-generation',                 priority: 0.95, freq: 'weekly' },
    { path: '/about',                            priority: 0.8,  freq: 'monthly' },
    // SEO landing pages
    { path: '/ai-influencer-generator',          priority: 0.95, freq: 'weekly' },
    { path: '/free-ai-influencer-generator',     priority: 0.95, freq: 'weekly' },
    { path: '/realistic-ai-influencer-generator',priority: 0.9,  freq: 'weekly' },
    { path: '/ai-influencer-maker',              priority: 0.9,  freq: 'weekly' },
    { path: '/virtual-influencer-creator',       priority: 0.9,  freq: 'weekly' },
    // Niche pages
    { path: '/ai-fashion-influencer-generator',  priority: 0.85, freq: 'weekly' },
    { path: '/ai-fitness-influencer-generator',  priority: 0.85, freq: 'weekly' },
    { path: '/ai-instagram-influencer-generator',priority: 0.85, freq: 'weekly' },
    { path: '/ai-male-influencer-generator',     priority: 0.85, freq: 'weekly' },
    { path: '/ai-female-influencer-generator',   priority: 0.85, freq: 'weekly' },
    { path: '/privacy',                          priority: 0.4,  freq: 'yearly' },
    { path: '/terms',                            priority: 0.4,  freq: 'yearly' },
    { path: '/cookie',                           priority: 0.4,  freq: 'yearly' },
  ].map(({ path: routePath, priority, freq }) => ({
    url: `${baseUrl}${routePath}`,
    lastModified: new Date().toISOString(),
    changeFrequency: freq as any,
    priority,
  }));

  // Helper to dynamically read directories for Next.js App Router
  const getDynamicRoutes = (dirPath: string, basePath: string, priority: number, freq: string) => {
    try {
      const fullPath = path.join(process.cwd(), 'src', 'app', dirPath);
      if (!fs.existsSync(fullPath)) return [];
      
      const entries = fs.readdirSync(fullPath, { withFileTypes: true });
      
      return entries
        .filter(entry => 
          entry.isDirectory() && 
          !entry.name.startsWith('[') && // Ignore dynamic routes like [slug]
          !entry.name.startsWith('_') && // Ignore private folders
          fs.existsSync(path.join(fullPath, entry.name, 'page.tsx'))
        )
        .map(entry => {
          // Fetch the actual last modified date of the page.tsx file
          const stats = fs.statSync(path.join(fullPath, entry.name, 'page.tsx'));
          return {
            url: `${baseUrl}${basePath}/${entry.name}`,
            lastModified: stats.mtime.toISOString(),
            changeFrequency: freq as any,
            priority,
          };
        });
    } catch (error) {
      console.error(`Error reading ${dirPath} for sitemap:`, error);
      return [];
    }
  };

  // Auto-detect all tools and blogs
  const toolRoutes = getDynamicRoutes('tools', '/tools', 0.9, 'weekly');
  const blogRoutes = getDynamicRoutes('blog', '/blog', 0.8, 'monthly');

  return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}
