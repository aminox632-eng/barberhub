import { SITE_URL, locales } from '@/lib/config';

export default function sitemap() {
  const pages = ['', '/explore', '/login', '/register'];
  return locales.flatMap((l) => pages.map((p) => ({ url: `${SITE_URL}/${l}${p}`, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.7 })));
}
