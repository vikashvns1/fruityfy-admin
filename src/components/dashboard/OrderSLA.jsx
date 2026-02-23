import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { MdWarning, MdAccessTime } from 'react-icons/md';

const OrderSLA = ({ range }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSLA = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/dashboard/order-sla?range=${range}`);
        if (res.data.success) setData(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchSLA();
  }, [range]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm animate-pulse mb-8">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MdAccessTime /> Order SLA Monitoring
      </h3>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-500">Active Orders</p>
          <p className="text-xl font-bold">{data.total_active_orders}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <p className="text-yellow-700">Delayed Orders</p>
          <p className="text-xl font-bold text-yellow-700">
            {data.delayed_orders}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-green-700">Avg Delivery Time</p>
          <p className="text-xl font-bold text-green-700">
            {data.avg_delivery_minutes} min
          </p>
        </div>
      </div>

      {/* Delayed Orders */}
      {data.delayed_orders_list.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-red-600">
            <MdWarning /> Delayed Orders
          </h4>

          <div className="space-y-2 text-sm">
            {data.delayed_orders_list.map(order => (
              <div
                key={order.id}
                className="flex justify-between bg-red-50 p-3 rounded-lg"
              >
                <span className="font-mono">#{order.id}</span>
                <span className="capitalize">{order.order_status}</span>
                <span className="font-semibold">
                  {order.age_minutes} min
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderSLA;
