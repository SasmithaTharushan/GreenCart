import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { getSource, track } from '../lib/analytics';

const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot – real people never see this field
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await api('/marketing/subscribe', { method: 'POST', body: { email, website, source: getSource() } });
    setLoading(false);
    if (!data.success) return toast.error(data.message);
    toast.success(data.message);
    track('generate_lead', { method: 'newsletter' });
    setEmail('');
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-2 mt-24 pb-14">
      <h2 className="md:text-4xl text-2xl font-semibold">Never Miss a Deal!</h2>
      <p className="md:text-lg text-gray-500/70 pb-8">Subscribe to get the latest offers, new arrivals, and exclusive discounts</p>
      <form onSubmit={onSubmit} className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
        <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)}
          className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <input value={email} onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
          type="email" placeholder="Enter your email" aria-label="Email address" required />
        <button type="submit" disabled={loading}
          className="md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer rounded-md rounded-l-none disabled:opacity-60">
          {loading ? '…' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;
