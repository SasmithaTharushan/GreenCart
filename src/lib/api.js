// Tiny fetch wrapper for the GreenCart API (same origin on Vercel; proxied by Vite in dev).
export async function api(path, { method = 'GET', body, form } = {}) {
  const opts = { method, credentials: 'include' };
  if (form) opts.body = form;
  else if (body !== undefined) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  try {
    const res = await fetch(`/api${path}`, opts);
    const data = await res.json().catch(() => ({}));
    if (typeof data.success !== 'boolean') data.success = res.ok;
    if (!data.success && !data.message) data.message = `Request failed (${res.status})`;
    data.status = res.status;
    return data;
  } catch {
    return { success: false, status: 0, message: 'Network error – check your connection' };
  }
}
