import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdLink,
  MdVisibility,
  MdVisibilityOff
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners');
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      toast.success('Banner deleted');
      fetchBanners();
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  const badgeColor = (pos) => {
    switch (pos) {
      case 'home_main': return 'bg-blue-100 text-blue-800';
      case 'home_middle': return 'bg-purple-100 text-purple-800';
      case 'sidebar': return 'bg-orange-100 text-orange-800';
      case 'footer': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#064E3B]">
            App Banners
          </h1>
          <p className="text-xs text-gray-500">
            Manage hero, middle, sidebar & footer banners
          </p>
        </div>

        <Link
          to="/banners/add"
          className="bg-[#064E3B] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <MdAdd size={20} /> Add Banner
        </Link>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-3 text-center text-gray-400">
            Loading banners…
          </p>
        ) : banners.length === 0 ? (
          <div className="col-span-3 text-center py-12 border border-dashed rounded-xl">
            No banners found
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* IMAGE */}
              <div className="relative h-44 bg-gray-100">
                <img
                  src={`http://localhost:5000${b.media_url}`}
                  alt={b.title}
                  className="h-full w-full object-cover"
                />

                {/* POSITION */}
                <span
                  className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase rounded ${badgeColor(b.position)}`}
                >
                  {b.position.replace('_', ' ')}
                </span>

                {/* ORDER */}
                <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded">
                  Order: {b.sort_order}
                </span>
              </div>

              {/* CONTENT */}
              <div className="p-4 space-y-2 text-sm">

                {/* TITLE + STATUS */}
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#064E3B] truncate">
                    {b.title}
                  </h3>
                  {b.is_active ? (
                    <MdVisibility className="text-green-500" title="Active" />
                  ) : (
                    <MdVisibilityOff className="text-gray-400" title="Inactive" />
                  )}
                </div>

                {/* SUBTITLE */}
                {b.subtitle && (
                  <p className="text-gray-600 text-xs line-clamp-2">
                    {b.subtitle}
                  </p>
                )}

                {/* META */}
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    CTA: {b.cta_text || '—'}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    Align: {b.text_align}
                  </span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">
                    Overlay: {b.overlay}
                  </span>
                </div>

                {/* LINK */}
                {b.click_url ? (
                  <div className="flex items-center gap-1 text-blue-600 text-xs truncate">
                    <MdLink /> {b.click_url}
                  </div>
                ) : (
                  <div className="text-xs italic text-gray-400">
                    No click URL
                  </div>
                )}

                {/* FOOTER */}
                <div className="flex justify-between items-center pt-3 border-t mt-3">
                  <span className="text-xs text-gray-400">
                    {new Date(b.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      to={`/banners/edit/${b.id}`}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                    >
                      <MdEdit size={18} />
                    </Link>

                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default AllBanners;
