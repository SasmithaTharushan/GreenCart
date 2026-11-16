import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { track } from '../lib/analytics';
import { site, whatsappLink } from '../config';
import Seo from '../components/Seo';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [sending, setSending] = useState(false);
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const data = await api('/marketing/contact', { method: 'POST', body: form });
    setSending(false);
    if (!data.success) return toast.error(data.message);
    toast.success(data.message);
    track('contact', { method: 'form' });
    setForm({ name: '', email: '', message: '', website: '' });
  };

  const wa = whatsappLink('Hi GreenCart!');
  const input = 'w-full px-3 py-2.5 border border-gray-500/30 rounded outline-none focus:border-primary transition';

  return (
    <div className="mt-16 pb-16 grid md:grid-cols-2 gap-12">
      <Seo title="Contact Us" description="Questions about an order, delivery or a product? Message the GreenCart team." />
      <div>
        <p className="text-2xl md:text-3xl text-gray-500">
          Get in <span className="font-semibold text-primary">Touch</span>
        </p>
        <p className="mt-4 text-gray-500 max-w-md">
          Questions about an order, delivery or a product? Send us a message and we'll reply as soon as we can.
        </p>
        <div className="mt-8 space-y-3 text-gray-600">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => track('contact', { method: 'whatsapp' })}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#25D366] text-white hover:opacity-90 transition">
              Chat on WhatsApp
            </a>
          )}
          {site.email && (
            <p>Email: <a className="text-primary hover:underline" href={`mailto:${site.email}`}>{site.email}</a></p>
          )}
          <p>Payment: Cash on delivery</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 text-sm max-w-md">
        <input type="text" name="website" value={form.website} onChange={set} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <input className={input} name="name" value={form.name} onChange={set} placeholder="Your name" aria-label="Your name" required />
        <input className={input} name="email" type="email" value={form.email} onChange={set} placeholder="Email address" aria-label="Email address" required />
        <textarea className={`${input} resize-none`} name="message" rows={6} value={form.message} onChange={set}
          placeholder="How can we help?" aria-label="Message" required maxLength={3000} />
        <button disabled={sending}
          className="w-full bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer disabled:opacity-60">
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
};

export default Contact;
