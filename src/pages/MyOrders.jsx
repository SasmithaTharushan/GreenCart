import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { api } from '../lib/api';
import Seo from '../components/Seo';

export const statusColor = (s) =>
  ({
    'Order Placed': 'bg-blue-50 text-blue-600',
    Packing: 'bg-amber-50 text-amber-600',
    'Out for delivery': 'bg-purple-50 text-purple-600',
    Delivered: 'bg-green-50 text-green-600',
    Cancelled: 'bg-red-50 text-red-500',
  })[s] || 'bg-gray-100 text-gray-600';

const MyOrders = () => {
  const { user, authChecked, currency, setShowUserLogin, navigate } = useAppContext();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!user) return;
    api('/order/user').then((data) => setOrders(data.success ? data.orders : []));
  }, [user]);

  if (authChecked && !user) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[60vh] gap-4">
        <Seo title="My Orders" noindex />
        <p className="text-2xl font-medium">Log in to see your orders</p>
        <button onClick={() => setShowUserLogin(true)}
          className="px-8 py-2.5 bg-primary hover:bg-primary-dull text-white rounded transition cursor-pointer">
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="mt-16 pb-16">
      <Seo title="My Orders" noindex />
      <div className="flex flex-col items-end w-max mb-8">
        <p className="text-2xl font-medium uppercase">My orders</p>
        <div className="w-16 h-0.5 bg-primary rounded-full"></div>
      </div>

      {orders === null ? (
        <div className="h-48 max-w-4xl rounded bg-gray-100 animate-pulse" />
      ) : orders.length === 0 ? (
        <div className="text-gray-500">
          You haven't placed any orders yet.{' '}
          <button onClick={() => navigate('/products')} className="text-primary hover:underline cursor-pointer">Start shopping</button>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl">
            <div className="flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col gap-1 text-sm">
              <span>Order: #{order._id.slice(-8).toUpperCase()}</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>Payment: {order.paymentType === 'COD' ? 'Cash on delivery' : order.paymentType}{order.isPaid ? ' (paid)' : ''}</span>
              <span className="text-gray-700">Total: {currency}{order.amount.toFixed(2)}</span>
            </div>
            <p className="mt-3">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.status)}`}>{order.status}</span>
            </p>
            {order.items.map((item, index) => (
              <div key={index}
                className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 && 'border-b'} border-gray-300 flex flex-col md:flex-row md:items-center justify-between p-4 py-5 md:gap-16 w-full`}>
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-medium text-gray-800">{item.name}</h2>
                    <p>Category: {item.category}</p>
                  </div>
                </div>
                <p>Quantity: {item.quantity}</p>
                <p className="text-primary text-lg font-medium">{currency}{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default MyOrders;
