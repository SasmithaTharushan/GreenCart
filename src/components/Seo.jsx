import { useEffect } from 'react';
import { site } from '../config';

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

// Per-page title, description, Open Graph and canonical tags.
const Seo = ({ title, description = site.description, image, noindex = false }) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${site.name}` : `${site.name} – ${site.tagline}`;
    const url = site.url + window.location.pathname;
    const img = image ? (image.startsWith('http') ? image : site.url + image) : `${site.url}/og-image.png`;

    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', img);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, image, noindex]);

  return null;
};

export default Seo;
