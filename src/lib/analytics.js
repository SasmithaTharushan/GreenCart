// Free marketing layer: GA4, Meta Pixel and Vercel Web Analytics, each switched on by an env var.
// Also remembers where a visitor came from (UTM tags / referrer) so orders and signups can be attributed.
const env = import.meta.env;
const GA_ID = env.VITE_GA_ID;
const PIXEL_ID = env.VITE_META_PIXEL_ID;
const SOURCE_KEY = 'gc_source';

function loadScript(src) {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

export function initAnalytics() {
  if (typeof window === 'undefined') return;

  if (GA_ID) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false }); // we send page views on route change
  }

  if (PIXEL_ID && !window.fbq) {
    const fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = window._fbq = fbq;
    loadScript('https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
  }

  if (env.VITE_VERCEL_ANALYTICS === 'true' && env.PROD) {
    window.va = window.va || function () {
      (window.vaq = window.vaq || []).push(arguments);
    };
    loadScript('/_vercel/insights/script.js');
  }

  captureSource();
}

export function trackPageView(path) {
  window.gtag?.('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title });
  window.fbq?.('track', 'PageView');
}

const PIXEL_EVENTS = {
  view_item: 'ViewContent',
  add_to_cart: 'AddToCart',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
  sign_up: 'CompleteRegistration',
  generate_lead: 'Lead',
  search: 'Search',
  contact: 'Contact',
};

// track('add_to_cart', { value, currency, items: [...] })
export function track(event, params = {}) {
  try {
    window.gtag?.('event', event, params);
    const pixelEvent = PIXEL_EVENTS[event];
    if (pixelEvent && window.fbq) {
      window.fbq('track', pixelEvent, {
        value: params.value,
        currency: params.currency,
        content_ids: params.items?.map((i) => i.item_id),
        content_type: 'product',
        search_string: params.search_term,
      });
    }
    window.va?.('event', { name: event, data: { value: params.value } });
  } catch {
    /* analytics must never break the shop */
  }
}

export const toItem = (p, quantity = 1) => ({
  item_id: p._id,
  item_name: p.name,
  item_category: p.category,
  price: p.offerPrice,
  quantity,
});

function captureSource() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      if (params.get(k)) utm[k] = params.get(k);
    }
    const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : '';
    // First touch wins until a new campaign link is used.
    if (Object.keys(utm).length || (referrer && !localStorage.getItem(SOURCE_KEY))) {
      localStorage.setItem(SOURCE_KEY, JSON.stringify({ ...utm, referrer, landing: window.location.pathname }));
    }
  } catch {
    /* storage may be unavailable */
  }
}

export function getSource() {
  try {
    return JSON.parse(localStorage.getItem(SOURCE_KEY) || '{}');
  } catch {
    return {};
  }
}
