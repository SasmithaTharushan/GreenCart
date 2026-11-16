import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import Seo from '../../components/Seo';

const SellerLogin = () => {
  const { setIsSeller } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = await api('/seller/login', { method: 'POST', body: { email, password } });
    setLoading(false);
    if (!data.success) return toast.error(data.message);
    setIsSeller(true);
    toast.success('Welcome to the seller dashboard');
  };

  return (
    <form onSubmit={onSubmit} className="min-h-screen flex items-center text-sm text-gray-600">
      <Seo title="Seller Login" noindex />
      <div className="flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">Seller</span> Login
        </p>
        <label className="w-full">
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="seller email" autoComplete="username"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" required />
        </label>
        <label className="w-full">
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="password" autoComplete="current-password"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" required />
        </label>
        <button disabled={loading} className="bg-primary hover:bg-primary-dull text-white w-full py-2 rounded-md cursor-pointer disabled:opacity-60">
          {loading ? 'Please wait…' : 'Login'}
        </button>
      </div>
    </form>
  );
};

export default SellerLogin;
