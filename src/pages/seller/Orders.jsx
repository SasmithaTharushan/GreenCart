import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../lib/api';
import { statusColor } from '../MyOrders';

const STATUSES = ['Order Placed', 'Packing', 'Out for delivery', 'Delivered', 'Cancelled'];

const Orders = () => {
  const { currency } = useAppContext();
  const [orders, setOrders] = useState(null);

  const fetchOrders = async () => {
    const data = await api('/order/seller');
    if (data.success) setOrders(data.orders);
    else {
      toast.error(data.message);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const changeStatus = async (orderId, status) => {
    const data = await api('/order/status', { method: 'POST', body: { orderId, status } });
    if (!data.success) return toast.error(data.message);
    toast.success(data.message);
    fetchOrders();
  };

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-4">
        <h2 className="text-lg font-medium">Orders {orders && `(${orders.length})`}</h2>
        {orders === null && <div className="h-32 max-w-4xl bg-gray-100 rounded animate-pulse" />}
        {orders?.length === 0 && <p className="text-gray-500">No orders yet.</p>}
        {orders?.map((order) => (
          <div key={order._id}
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[2fr_2fr_1fr_1.5fr] xl:items-center gap-5 p-5 max-w-4xl rounded-md border border-gray-300 text-gray-800">
            <div className="flex gap-4 min-w-0">
              <img className="w-12 h-12 object-cover shrink-0" src={assets.box_icon} alt="" />
              <div className="min-w-0">
                {order.items.map((item, index) => (
                  <p key={index} className="font-medium">
                    {item.name} <span className="text-primary">x {item.quantity}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="text-sm text-black/60 min-w-0 break-words">
              <p className="text-black/80">{order.address.firstName} {order.address.lastName}</p>
              <p>{order.address.street}, {order.address.city}</p>
              <p>{order.address.state}, {order.address.zipcode}, {order.address.country}</p>
              <p>{order.address.phone}</p>
            </div>

            <p className="font-medium text-lg whitespace-nowrap">{currency}{order.amount.toFixed(2)}</p>

            <div className="flex flex-col text-sm text-black/60 gap-1">
              <p>Method: {order.paymentType}</p>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Payment: {order.isPaid ? 'Paid' : 'Pending'}</p>
              {order.source?.utm_source && <p>Source: {order.source.utm_source}</p>}
              <select value={order.status} onChange={(e) => changeStatus(order._id, e.target.value)}
                className={`mt-1 text-sm px-2 py-1 rounded outline-none ${statusColor(order.status)}`}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
