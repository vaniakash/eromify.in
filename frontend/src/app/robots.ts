import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.eromify.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/auth/',   // NextAuth session – required for JS hydration
        ],
        disallow: [
          '/api/payment/',
          '/api/admin/',
          '/api/user/',
          '/api/generate-image',
          '/admin/',
          '/login',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
