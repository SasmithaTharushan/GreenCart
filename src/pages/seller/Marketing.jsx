import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { api } from '../../lib/api';

const Stat = ({ label, value }) => (
  <div className="border border-gray-300 rounded-md p-4 min-w-36">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-medium mt-1">{value}</p>
  </div>
);

const Marketing = () => {
  const { currency } = useAppContext();
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/marketing/overview').then((d) => {
      if (d.success) setData(d);
      else toast.error(d.message);
    });
  }, []);

  if (!data) return <div className="md:p-10 p-4"><div className="h-32 max-w-4xl bg-gray-100 rounded animate-pulse" /></div>;

  const sources = Object.entries(data.stats.bySource).sort((a, b) => b[1].revenue - a[1].revenue);

  return (
    <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll">
      <div className="md:p-10 p-4 space-y-10 max-w-4xl">
        <div>
          <h2 className="text-lg font-medium mb-4">Overview</h2>
          <div className="flex flex-wrap gap-4">
            <Stat label="Orders" value={data.stats.orders} />
            <Stat label="Revenue" value={`${currency}${data.stats.revenue.toFixed(2)}`} />
            <Stat label="Subscribers" value={data.stats.subscribers} />
            <Stat label="Messages" value={data.messages.length} />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-1">Sales by traffic source</h2>
          <p className="text-sm text-gray-500 mb-4">
            Add UTM tags to links you share, e.g. <code className="bg-gray-100 px-1">?utm_source=instagram&amp;utm_campaign=weekend_deals</code>
          </p>
          {sources.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet.</p>
          ) : (
            <table className="w-full text-sm border border-gray-300 rounded">
              <thead className="text-left bg-gray-50">
                <tr><th className="px-4 py-2">Source</th><th className="px-4 py-2">Orders</th><th className="px-4 py-2">Revenue</th></tr>
              </thead>
              <tbody>
                {sources.map(([src, s]) => (
                  <tr key={src} className="border-t border-gray-200">
                    <td className="px-4 py-2">{src}</td>
                    <td className="px-4 py-2">{s.orders}</td>
                    <td className="px-4 py-2">{currency}{s.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Newsletter subscribers</h2>
            <a href="/api/marketing/subscribers.csv" className="text-sm text-primary hover:underline">Download CSV</a>
          </div>
          {data.subscribers.length === 0 ? (
            <p className="text-gray-500 text-sm">No subscribers yet.</p>
          ) : (
            <ul className="text-sm divide-y divide-gray-200 border border-gray-300 rounded max-h-72 overflow-y-auto">
              {data.subscribers.map((s) => (
                <li key={s._id} className="px-4 py-2 flex justify-between gap-4">
                  <span>{s.email}</span>
                  <span className="text-gray-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Contact messages</h2>
          {data.messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet.</p>
          ) : (
            <div className="space-y-3">
              {data.messages.map((m) => (
                <div key={m._id} className="border border-gray-300 rounded p-4 text-sm">
                  <p className="font-medium">
                    {m.name} · <a className="text-primary" href={`mailto:${m.email}`}>{m.email}</a>
                    <span className="text-gray-400 font-normal"> · {new Date(m.createdAt).toLocaleString()}</span>
                  </p>
                  <p className="mt-2 text-gray-600 whitespace-pre-wrap">{m.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketing;
