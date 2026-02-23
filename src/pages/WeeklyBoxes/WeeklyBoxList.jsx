import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';

const IMAGE_BASE = 'http://localhost:5000';

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
      await api.delete(`/weekly-boxes/${id}`);
      toast.success('Weekly box deleted');
      loadData();
    } catch {
      // handled globally
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-[#064E3B]">
            Weekly Fruit Boxes
          </h1>

          <button
            onClick={() => navigate('/weekly-boxes/new')}
            className="flex items-center gap-2 bg-[#064E3B] text-white px-4 py-2 rounded"
          >
            <MdAdd /> Add Box
          </button>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {boxes.map(box => (
            <div
              key={box.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden
                ${box.is_active === 0 ? 'opacity-60' : ''}`}
            >
              {/* IMAGE */}
              {box.image ? (
                <img
                  src={IMAGE_BASE + box.image}
                  className="h-44 w-full object-cover"
                  alt={box.title}
                />
              ) : (
                <div className="h-44 bg-gray-100 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}

              {/* CONTENT */}
              <div className="p-4 space-y-2">
                {/* TITLE + BADGE */}
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#064E3B]">
                    {box.title}
                  </h3>

                  {box.is_popular === 1 && (
                    <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded">
                      Popular
                    </span>
                  )}
                </div>

                {/* SUBTITLE */}
                {box.subtitle && (
                  <p className="text-sm text-gray-600">
                    {box.subtitle}
                  </p>
                )}

                {/* FRUIT RANGE */}
                {box.fruit_range && (
                  <p className="text-sm font-medium text-gray-800">
                    {box.fruit_range}
                  </p>
                )}

                {/* PRICE */}
                <p className="font-semibold text-[#064E3B]">
                  AED {box.price}
                </p>

                {/* STATUS */}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded
                      ${box.is_active === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'}`}
                  >
                    {box.is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() =>
                      navigate(`/weekly-boxes/edit/${box.id}`)
                    }
                    className="text-blue-600 flex items-center gap-1"
                  >
                    <MdEdit /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(box.id)}
                    className="text-red-600 flex items-center gap-1"
                  >
                    <MdDelete /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* EMPTY */}
          {boxes.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              No weekly boxes found
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WeeklyBoxList;
