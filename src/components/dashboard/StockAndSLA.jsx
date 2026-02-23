import { MdWarning } from 'react-icons/md';

const StockAndSLA = ({ stats }) => {
  if (!stats) return null;

  const { low_stock_products } = stats;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="font-bold text-gray-800 mb-4">
        📦 Stock Intelligence
      </h3>

      {low_stock_products.length === 0 ? (
        <p className="text-sm text-green-600">
          All products sufficiently stocked 🎉
        </p>
      ) : (
        <div className="space-y-3">
          {low_stock_products.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm bg-red-50 p-3 rounded-lg"
            >
              <div className="flex items-center gap-2 text-red-700">
                <MdWarning />
                <span>{p.name}</span>
              </div>
              <span className="font-bold">
                {p.stock_quantity} left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockAndSLA;
