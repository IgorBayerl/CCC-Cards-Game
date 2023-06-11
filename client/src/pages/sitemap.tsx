import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://cyberchaoscards.com',
      lastModified: new Date(),
    },
    {
      url: 'https://cyberchaoscards.com/howToPlay',
      lastModified: new Date(),
    },
    {
      url: 'https://cyberchaoscards.com/terms',
      lastModified: new Date(),
    },
    {
      url: 'https://cyberchaoscards.com/privacy',
      lastModified: new Date(),
    },
    {
      url: 'https://cyberchaoscards.com/contact',
      lastModified: new Date(),
    },
    {
      url: 'https://cyberchaoscards.com/about',
      lastModified: new Date(),
    },
  ]
}
