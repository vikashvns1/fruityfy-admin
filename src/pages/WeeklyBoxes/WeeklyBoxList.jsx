import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import api,{API_BASE_URL} from '../../utils/api';
import { MdAdd, MdEdit, MdDelete, MdShoppingBasket, MdTrendingDown } from 'react-icons/md';
import { toast } from 'react-toastify';

const IMAGE_BASE = API_BASE_URL;

const WeeklyBoxList = () => {
  const navigate = useNavigate();
  const [boxes, setBoxes] = useState([]);

  // =============================
  // LOAD WEEKLY BOXES
  // =============================
  const loadData = async () => {
    try {
      const res = await api.get('/weeklyBox');
      if (res.data.success) {
        setBoxes(res.data.data || []);
      }
    } catch {
      // handled globally
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =============================
  // DELETE
  // =============================
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this weekly box?')) return;

    try {
      await api.delete(`/weeklyBox/${id}`); // Updated endpoint based on your controller
      toast.success('Weekly box deleted');
      loadData();
    } catch {
      // handled globally
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-[#064E3B]">
              Weekly Fruit Bundles
            </h1>
            <p className="text-sm text-gray-500">Manage your subscription boxes and track market value savings.</p>
          </div>

          <button
            onClick={() => navigate('/weekly-boxes/new')}
            className="flex items-center gap-2 bg-[#064E3B] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
          >
            <MdAdd size={20} /> Create New Box
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {boxes.map(box => {
            const mktPrice = Number(box.market_value || 0);
            const sellPrice = Number(box.price || 0);
            const savings = mktPrice - sellPrice;
            const savePercent = mktPrice > 0 ? ((savings / mktPrice) * 100).toFixed(0) : 0;

            return (
              <div
                key={box.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md
                  ${box.is_active === 0 ? 'grayscale opacity-70' : ''}`}
              >
                {/* IMAGE & BADGES */}
                <div className="relative h-48">
                  {box.image ? (
                    <img
                      src={IMAGE_BASE + box.image}
                      className="h-full w-full object-cover"
                      alt={box.title}
                    />
                  ) : (
                    <div className="h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  
                  {/* Popular Tag */}
                  {box.is_popular === 1 && (
                    <span className="absolute top-3 right-3 bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                      Popular
                    </span>
                  )}

                  {/* Discount Tag */}
                  {savings > 0 && (
                    <span className="absolute bottom-3 left-3 bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-lg shadow-sm">
                      {savePercent}% VALUE ADD
                    </span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-[#064E3B] line-clamp-1">
                      {box.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${box.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {box.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {box.subtitle || 'No description provided.'}
                  </p>

                  {/* STATS STRIP */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Items</p>
                        <p className="text-sm font-bold text-gray-700 flex items-center gap-1">
                            <MdShoppingBasket className="text-[#064E3B]" /> {box.item_count || 0} Products
                        </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Fruit Range</p>
                        <p className="text-sm font-bold text-gray-700 line-clamp-1">{box.fruit_range || 'N/A'}</p>
                    </div>
                  </div>

                  {/* PRICE ANALYTICS */}
                  <div className="bg-[#064E3B]/5 p-3 rounded-xl mb-6 border border-[#064E3B]/10">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Market Value:</span>
                        <span className="text-xs font-bold text-gray-400 line-through">AED {mktPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[#064E3B]">Selling Price:</span>
                        <span className="text-xl font-black text-[#064E3B]">AED {sellPrice.toFixed(0)}</span>
                    </div>
                    {savings > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#064E3B]/10 flex items-center justify-between text-green-600 font-bold text-[11px]">
                            <span className="flex items-center gap-1"><MdTrendingDown /> User Savings:</span>
                            <span>AED {savings.toFixed(2)}</span>
                        </div>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-auto pt-4 flex gap-3">
                    <button
                      onClick={() => navigate(`/weekly-boxes/edit/${box.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 border-2 border-[#064E3B] text-[#064E3B] py-2 rounded-xl font-bold hover:bg-[#064E3B] hover:text-white transition-all text-sm"
                    >
                      <MdEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(box.id)}
                      className="w-12 flex items-center justify-center border-2 border-red-100 text-red-500 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* EMPTY STATE */}
          {boxes.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed">
                <MdShoppingBasket size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No weekly boxes found. Start by adding one!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WeeklyBoxList;