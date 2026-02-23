import {
  MdAttachMoney,
  MdShoppingBag,
  MdInventory,
  MdPeople,
} from 'react-icons/md';

const Stat = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const DashboardKPI = ({ stats, loading }) => {
  if (loading || !stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Stat
        title="Revenue"
        value={`AED ${stats.total_revenue}`}
        icon={<MdAttachMoney size={22} />}
        color="bg-green-50 text-green-600"
      />
      <Stat
        title="Orders"
        value={stats.total_orders}
        icon={<MdShoppingBag size={22} />}
        color="bg-blue-50 text-blue-600"
      />
      <Stat
        title="Products"
        value={stats.total_products}
        icon={<MdInventory size={22} />}
        color="bg-orange-50 text-orange-600"
      />
      <Stat
        title="Customers"
        value={stats.total_customers}
        icon={<MdPeople size={22} />}
        color="bg-purple-50 text-purple-600"
      />
    </div>
  );
};

export default DashboardKPI;
