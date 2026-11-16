import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';
import { api } from '../lib/api';
import Seo from '../components/Seo';

const InputField = ({ type = 'text', placeholder, name, handleChange, address, autoComplete }) => (
  <input
    className="w-full px-2.5 py-2.5 border border-gray-500/30 rounded outline-none text-gray-500 focus:border-primary transition"
    type={type}
    placeholder={placeholder}
    aria-label={placeholder}
    onChange={handleChange}
    name={name}
    value={address[name]}
    autoComplete={autoComplete}
    required
  />
);

const EMPTY = { firstName: '', lastName: '', email: '', street: '', city: '', state: '', zipcode: '', country: '', phone: '' };

const AddAddress = () => {
  const { user, authChecked, navigate, setShowUserLogin } = useAppContext();
  const [address, setAddress] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authChecked && !user) {
      toast('Please log in to add an address');
      setShowUserLogin(true);
      navigate('/cart');
    }
    if (user) setAddress((a) => ({ ...a, email: a.email || user.email }));
  }, [authChecked, user, navigate, setShowUserLogin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = await api('/address/add', { method: 'POST', body: { address } });
    setSaving(false);
    if (!data.success) return toast.error(data.message);
    toast.success(data.message);
    navigate('/cart');
  };

  const field = (name, placeholder, extra = {}) => (
    <InputField handleChange={handleChange} address={address} name={name} placeholder={placeholder} {...extra} />
  );

  return (
    <div className="mt-16 pb-16">
      <Seo title="Add Shipping Address" noindex />
      <p className="text-2xl md:text-3xl text-gray-500">
        Add Shipping <span className="font-semibold text-primary">Address</span>
      </p>

      <div className="flex flex-col-reverse md:flex-row justify-between mt-10">
        <div className="flex-1 max-w-md">
          <form onSubmit={onSubmitHandler} className="space-y-3 mt-6 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {field('firstName', 'First Name', { autoComplete: 'given-name' })}
              {field('lastName', 'Last Name', { autoComplete: 'family-name' })}
            </div>
            {field('email', 'Email Address', { type: 'email', autoComplete: 'email' })}
            {field('street', 'Street', { autoComplete: 'street-address' })}
            <div className="grid grid-cols-2 gap-4">
              {field('city', 'City', { autoComplete: 'address-level2' })}
              {field('state', 'State / Province', { autoComplete: 'address-level1' })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {field('zipcode', 'Zip / Postal Code', { autoComplete: 'postal-code' })}
              {field('country', 'Country', { autoComplete: 'country-name' })}
            </div>
            {field('phone', 'Phone', { type: 'tel', autoComplete: 'tel' })}

            <button disabled={saving}
              className="w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull transition cursor-pointer uppercase disabled:opacity-60">
              {saving ? 'Saving…' : 'Save address'}
            </button>
          </form>
        </div>
        <img className="md:mr-16 mb-16 md:mt-0 max-w-xs" src={assets.add_address_image} alt="" />
      </div>
    </div>
  );
};

export default AddAddress;
