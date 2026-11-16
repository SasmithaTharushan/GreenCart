import { useState } from 'react';
import toast from 'react-hot-toast';
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { compressImage } from '../../lib/image';

const AddProduct = () => {
  const { fetchProducts } = useAppContext();
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    const images = files.filter(Boolean);
    if (!images.length) return toast.error('Add at least one product image');
    setSaving(true);
    try {
      const form = new FormData();
      form.append('productData', JSON.stringify({ name, description: description.split('\n'), category, price, offerPrice }));
      for (const f of images) form.append('images', await compressImage(f));
      const data = await api('/product/add', { method: 'POST', form });
      if (!data.success) return toast.error(data.message);
      toast.success(data.message);
      setName(''); setDescription(''); setCategory(''); setPrice(''); setOfferPrice(''); setFiles([]);
      fetchProducts();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
      <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Images</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4).fill('').map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input accept="image/*" type="file" id={`image${index}`} hidden
                  onChange={(e) => {
                    const updated = [...files];
                    updated[index] = e.target.files[0];
                    setFiles(updated);
                  }} />
                <img className="max-w-24 cursor-pointer aspect-square object-cover rounded"
                  src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area} alt="Upload" width={100} height={100} />
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
          <input onChange={(e) => setName(e.target.value)} value={name} id="product-name" type="text" placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-description">Product Description <span className="text-gray-400 text-sm">(one point per line)</span></label>
          <textarea onChange={(e) => setDescription(e.target.value)} value={description} id="product-description" rows={4}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Fresh and organic&#10;Rich in vitamins" />
        </div>
        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">Category</label>
          <select onChange={(e) => setCategory(e.target.value)} value={category} id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required>
            <option value="">Select Category</option>
            {categories.map((item) => (
              <option key={item.path} value={item.path}>{item.text}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
            <input onChange={(e) => setPrice(e.target.value)} value={price} id="product-price" type="number" min="0" step="0.01" placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
            <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice} id="offer-price" type="number" min="0" step="0.01" placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
          </div>
        </div>
        <button disabled={saving} className="px-8 py-2.5 bg-primary text-white font-medium rounded cursor-pointer disabled:opacity-60">
          {saving ? 'Uploading…' : 'ADD'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
