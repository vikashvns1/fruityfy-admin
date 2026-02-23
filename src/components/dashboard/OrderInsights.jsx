import { MdWarning, MdSwapHoriz } from 'react-icons/md';

const OrderInsights = ({ stats }) => {
  if (!stats) return null;

  const { order_summary, pending_orders, pending_exchanges } = stats;

  // Define color mapping for statuses
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      case 'confirmed': return 'bg-blue-50 text-blue-700';
      case 'delivered': return 'bg-green-50 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="font-bold text-gray-800 mb-4">Order Insights</h3>

      {/* Grid for Order Statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 text-sm">
        {Object.entries(order_summary).map(([status, count]) => (
          <div key={status} className={`p-3 rounded-lg text-center ${getStatusColor(status)}`}>
            <p className="capitalize text-xs font-semibold opacity-80">{status.replaceAll('_', ' ')}</p>
            <p className="text-lg font-bold">{count}</p>
          </div>
        ))}
      </div>

      {/* Warnings Section */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        
        {/* Pending Orders Warning */}
        {pending_orders > 0 && (
          <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
            <MdWarning size={18} />
            <span>{pending_orders} new orders need attention</span>
          </div>
        )}

        {/* Pending Exchanges Warning (NEW) */}
        {pending_exchanges > 0 && (
          <div className="flex items-center gap-2 text-purple-700 bg-purple-50 px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto">
            <MdSwapHoriz size={18} />
            <span>{pending_exchanges} exchange/return requests pending</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderInsights;