import { GetServerSideProps } from 'next'
import { resolve } from 'path'

export default function Sitemap() {
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'text/xml')
  const xml = await new Promise((resolve) => {
    resolve(generateSitemapXml())
  })
  res.write(xml)
  res.end()
  return {
    props: {},
  }
}

function generateSitemapXml(): string {
  const pages = ['', 'about', 'contact', 'privacy', 'terms']

  const lastMod = new Date().toISOString().split('T')[0]?.trim() || '2023-06-11'

  return `
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map((page) => {
      return `
        <url>
          <loc>${`https://cyberchaoscards.com/${page}`}</loc>
          <lastmod>
            ${lastMod}
          </lastmod>
        </url>
      `
    })
    .join('')}
  </urlset>
  `
}
