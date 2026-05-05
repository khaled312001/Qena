import { Helmet } from 'react-helmet-async';

// Reusable SEO component — sets <title>, meta description/keywords/OG/Twitter,
// and an optional JSON-LD block for the current page. Every page that wants
// better ranking should mount <SEO .../> at the top.
//
// Props:
//   title:       full page title (will NOT append "قناوي —")
//   description: 150-160 char meta description (Arabic)
//   keywords:    comma-separated Arabic + English keywords
//   path:        URL path (e.g. "/category/hospitals") — for canonical
//   image:       og:image URL (absolute or starting with /)
//   jsonLd:      array of structured-data objects
export default function SEO({ title, description, keywords, path = '', image, jsonLd = [] }) {
  const origin = 'https://qinawy.com';
  const url = origin + path;
  const ogImage = image ? (image.startsWith('http') ? image : origin + image) : origin + '/logo.svg';
  const finalTitle = title || 'قناوي | دليل قنا الشامل';

  return (
    <Helmet prioritizeSeoTags>
      <title>{finalTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      <meta property="og:title" content={finalTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="ar_EG" />

      <meta name="twitter:title" content={finalTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={ogImage} />

      {jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
}
