import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/contact', '/privacy', '/terms', '/auth/signin', '/auth/signup'],
        disallow: ['/api/', '/dashboard/', '/settings/', '/inventory/', '/requests/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
