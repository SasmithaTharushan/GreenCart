import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import { api } from '../lib/api';
import { getSource, track, toItem } from '../lib/analytics';
import { site } from '../config';
import Seo from '../components/Seo';

const TAX_RATE = 0.02; // must match server/controllers/orderController.js

const formatAddress = (a) => `${a.street}, ${a.city}, ${a.state}, ${a.country}`;

const Cart = () => {
  const {
    user, setShowUserLogin, products, productsLoading, currency, cartItems, removeFromCart,
    getCartCount, updateCartItem, navigate, getCartAmount, clearCart,
  } = useAppContext();

  const [addresses, setAddresses] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [placing, setPlacing] = useState(false);

  const cartArray = useMemo(
    () =>
      Object.entries(cartItems)
        .map(([id, quantity]) => {
          const p = products.find((item) => item._id === id);
          return p ? { ...p, quantity } : null;
        })
        .filter(Boolean),
    [products, cartItems]
  );

  useEffect(() => {
    if (!user) {
      setAddresses([]);
      setSelectedAddress(null);
      return;
    }
    api('/address/get').then((data) => {
      if (!data.success) return;
      setAddresses(data.addresses);
      setSelectedAddress(data.addresses[0] || null);
    });
  }, [user]);

  const subtotal = getCartAmount();
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const placeOrder = async () => {
    if (!user) {
      toast('Please log in to place your order');
      return setShowUserLogin(true);
    }
    if (!selectedAddress) {
      toast.error('Please add a delivery address');
      return navigate('/add-address');
    }
    const items = cartArray.map((p) => ({ product: p._id, quantity: p.quantity }));
    track('begin_checkout', { currency: site.currencyCode, value: total, items: cartArray.map((p) => toItem(p, p.quantity)) });

    setPlacing(true);
    const data = await api('/order/cod', {
      method: 'POST',
      body: { items, addressId: selectedAddress._id, source: getSource() },
    });
    setPlacing(false);
    if (!data.success) return toast.error(data.message);

    track('purchase', {
      transaction_id: data.orderId,
      currency: site.currencyCode,
      value: data.amount,
      items: cartArray.map((p) => toItem(p, p.quantity)),
    });
    clearCart();
    toast.success('Order placed! Pay cash on delivery.');
    navigate('/my-orders');
  };

  if (productsLoading) return <div className="mt-16 h-96 rounded bg-gray-100 animate-pulse" />;

  if (cartArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[60vh] gap-4">
        <Seo title="Your Cart" noindex />
        <img src={assets.nav_cart_icon} alt="" className="w-12 opacity-50" />
        <p className="text-2xl font-medium">Your cart is empty</p>
        <p className="text-gray-500">Add some fresh picks and they'll show up here.</p>
        <button onClick={() => navigate('/products')}
          className="px-8 py-2.5 bg-primary hover:bg-primary-dull text-white rounded transition cursor-pointer">
          Start shopping
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-10 mt-16">
      <Seo title="Your Cart" noindex />
      {/* Left: Cart Items */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart <span className="text-sm text-primary">{getCartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product) => (
          <div key={product._id}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
            <div className="flex items-center md:gap-6 gap-3">
              <div onClick={() => navigate(`/products/${product.category.toLowerCase()}/${product._id}`)}
                className="cursor-pointer w-24 h-24 shrink-0 flex items-center justify-center border border-gray-300 rounded">
                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>{currency}{product.offerPrice} each</p>
                  <label className="flex items-center">
                    <span>Qty:</span>
                    <select className="outline-none ml-2" value={product.quantity}
                      onChange={(e) => updateCartItem(product._id, parseInt(e.target.value, 10))}>
                      {Array.from({ length: Math.max(9, product.quantity) }, (_, index) => (
                        <option key={index} value={index + 1}>{index + 1}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>
            <p className="text-center">{currency}{(product.offerPrice * product.quantity).toFixed(2)}</p>
            <button onClick={() => removeFromCart(product._id)} className="cursor-pointer mx-auto" aria-label={`Remove one ${product.name}`}>
              <img src={assets.remove_icon} alt="" className="inline-block w-6 h-6" />
            </button>
          </div>
        ))}

        <button onClick={() => navigate('/products')}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
          <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="" />
          Continue Shopping
        </button>
      </div>

      {/* Right: Order Summary */}
      <div className="max-w-[360px] w-full h-fit bg-gray-100/40 p-5 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        <div className="mb-6">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          <div className="relative flex justify-between items-start mt-2 gap-3">
            <p className="text-gray-500">
              {!user ? 'Log in to choose an address' : selectedAddress ? formatAddress(selectedAddress) : 'No address found'}
            </p>
            <button onClick={() => (user ? setShowAddress(!showAddress) : setShowUserLogin(true))}
              className="text-primary hover:underline cursor-pointer shrink-0">
              {user ? 'Change' : 'Log in'}
            </button>
            {showAddress && (
              <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full z-10">
                {addresses.map((address) => (
                  <p key={address._id} onClick={() => { setSelectedAddress(address); setShowAddress(false); }}
                    className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer">
                    {formatAddress(address)}
                  </p>
                ))}
                <p onClick={() => navigate('/add-address')}
                  className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10">
                  Add address
                </p>
              </div>
            )}
          </div>

          <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
          <p className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 text-gray-600">Cash On Delivery</p>
        </div>

        <hr className="border-gray-300" />

        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between"><span>Price</span><span>{currency}{subtotal.toFixed(2)}</span></p>
          <p className="flex justify-between"><span>Shipping Fee</span><span className="text-green-600">Free</span></p>
          <p className="flex justify-between"><span>Tax (2%)</span><span>{currency}{tax.toFixed(2)}</span></p>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span><span>{currency}{total.toFixed(2)}</span>
          </p>
        </div>

        <button onClick={placeOrder} disabled={placing}
          className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition disabled:opacity-60">
          {placing ? 'Placing order…' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
