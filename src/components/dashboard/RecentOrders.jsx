const statusColor = {
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
};

const RecentOrders = ({ orders, loading }) => {
  if (loading) return null;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="font-bold text-gray-800 mb-4">Recent Orders</h3>

      {orders?.length ? (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-mono">#{o.id}</td>
                <td className="p-3">{o.full_name}</td>
                <td className="p-3">AED {o.final_total}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                      statusColor[o.order_status] ||
                      'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {o.order_status.replaceAll('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-gray-400">No recent orders</p>
      )}
    </div>
  );
};

export default RecentOrders;
    