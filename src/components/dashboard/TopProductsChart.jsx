import { useEffect, useState } from 'react';
import api from '../../utils/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TopProductsChart = ({ range }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/dashboard/top-products?range=${range}`);
        if (res.data.success) setProducts(res.data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [range]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm animate-pulse mb-8">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="bg-white p-6 rounded-xl border shadow-sm mb-8 text-gray-400">
        No sales data available
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="font-bold text-gray-800 mb-4">
        🔥 Top Selling Products
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={products}>
          <XAxis dataKey="product_name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total_qty" fill="#064E3B" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;
