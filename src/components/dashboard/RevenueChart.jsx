import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const RevenueChart = ({ revenueChart }) => {
  if (!revenueChart?.length) {
    return (
      <div className="bg-white p-6 rounded-xl border mb-8 text-gray-400">
        No revenue data
      </div>
    );
  }

  const data = revenueChart.map(d => ({
    date: new Date(d.date).toLocaleDateString(),
    amount: Number(d.amount),
  }));

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm mb-8">
      <h3 className="font-bold text-gray-800 mb-4">Revenue Trend</h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#064E3B"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
