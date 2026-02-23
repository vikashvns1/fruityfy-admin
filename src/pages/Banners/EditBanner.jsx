import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdArrowBack, MdCloudUpload, MdSave } from 'react-icons/md';

const EditBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    cta_text: '',
    text_align: 'left',
    overlay: 'dark',
    click_url: '',
    position: 'home_main',
    sort_order: 0,
    is_active: 1,
    image: null
  });

  // ================= FETCH EXISTING BANNER =================
  useEffect(() => {
    const loadBanner = async () => {
      try {
        const res = await api.get('/banners');
        if (res.data.success) {
          const banner = res.data.data.find(b => b.id === Number(id));
          if (!banner) {
            toast.error('Banner not found');
            navigate('/banners');
            return;
          }

          setFormData({
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            cta_text: banner.cta_text || '',
            text_align: banner.text_align || 'left',
            overlay: banner.overlay || 'dark',
            click_url: banner.click_url || '',
            position: banner.position || 'home_main',
            sort_order: banner.sort_order || 0,
            is_active: banner.is_active,
            image: null
          });

          setPreview(`http://localhost:5000${banner.media_url}`);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load banner');
      } finally {
        setFetching(false);
      }
    };

    loadBanner();
  }, [id, navigate]);

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));
  };

  // ================= SUBMIT UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('cta_text', formData.cta_text);
    data.append('text_align', formData.text_align);
    data.append('overlay', formData.overlay);
    data.append('click_url', formData.click_url);
    data.append('position', formData.position);
    data.append('sort_order', formData.sort_order);
    data.append('is_active', formData.is_active);

    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const res = await api.put(`/banners/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Banner updated successfully');
        navigate('/banners');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update banner');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading banner data…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/banners')}
            className="p-2 bg-white border rounded-lg"
          >
            <MdArrowBack size={20} />
          </button>
          <h1 className="text-2xl font-serif font-bold text-[#064E3B]">
            Edit Banner
          </h1>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-sm border space-y-6"
        >

          {/* IMAGE */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {preview ? (
              <div className="h-48">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-contain rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">Click to change image</p>
              </div>
            ) : (
              <div className="py-8 text-gray-400 flex flex-col items-center">
                <MdCloudUpload size={48} />
                <p>Click to upload image</p>
              </div>
            )}
          </div>

          {/* INPUTS */}
          <div className="grid gap-4">
            <input
              className="p-3 border rounded-lg"
              placeholder="Banner Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <input
              className="p-3 border rounded-lg"
              placeholder="Subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />

            <input
              className="p-3 border rounded-lg"
              placeholder="CTA Text"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
            />

            <input
              className="p-3 border rounded-lg"
              placeholder="Click URL"
              value={formData.click_url}
              onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-lg"
                value={formData.text_align}
                onChange={(e) => setFormData({ ...formData, text_align: e.target.value })}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>

              <select
                className="p-3 border rounded-lg"
                value={formData.overlay}
                onChange={(e) => setFormData({ ...formData, overlay: e.target.value })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-lg"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                <option value="home_main">Home Main</option>
                <option value="home_middle">Home Middle</option>
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
              </select>

              <select
                className="p-3 border rounded-lg"
                value={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: Number(e.target.value) })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>

            <input
              type="number"
              className="p-3 border rounded-lg"
              placeholder="Sort Order"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({ ...formData, sort_order: e.target.value })
              }
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#064E3B] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? 'Updating…' : <><MdSave size={20} /> Update Banner</>}
          </button>

        </form>
      </div>
    </Layout>
  );
};

export default EditBanner;
