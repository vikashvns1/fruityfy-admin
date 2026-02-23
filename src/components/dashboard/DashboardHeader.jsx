const DashboardHeader = ({ range, setRange }) => {
  const ranges = {
    '1d': 'Today',
    '7d': '7 Days',
    '30d': '30 Days',
    '60d': '60 Days',
    '90d': '90 Days',
    '120d': '120 Days',
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#064E3B]">
          Dashboard Overview
        </h1>
        <p className="text-xs text-gray-500">
          Business performance summary
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {Object.keys(ranges).map(r => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-xs rounded-full border ${
              range === r
                ? 'bg-[#064E3B] text-white ring-2 ring-[#064E3B]/40'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            {ranges[r]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardHeader;
