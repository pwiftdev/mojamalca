import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mojamalca.si'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'sl': `${baseUrl}`,
        },
      },
    },
    {
      url: `${baseUrl}/sistem`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      alternates: {
        languages: {
          'sl': `${baseUrl}/sistem`,
        },
      },
    },
    {
      url: `${baseUrl}/sistem/podjetje/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          'sl': `${baseUrl}/sistem/podjetje/login`,
        },
      },
    },
    {
      url: `${baseUrl}/sistem/zaposleni/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: {
        languages: {
          'sl': `${baseUrl}/sistem/zaposleni/login`,
        },
      },
    },
    {
      url: `${baseUrl}/sistem/podjetje/admin`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
      alternates: {
        languages: {
          'sl': `${baseUrl}/sistem/podjetje/admin`,
        },
      },
    },
    {
      url: `${baseUrl}/sistem/zaposleni/narocanje`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
      alternates: {
        languages: {
          'sl': `${baseUrl}/sistem/zaposleni/narocanje`,
        },
      },
    },
  ]
} 