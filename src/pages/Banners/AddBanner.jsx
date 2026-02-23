import { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdArrowBack, MdCloudUpload, MdSave } from 'react-icons/md';

const AddBanner = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, image: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      toast.error('Please upload banner image');
      return;
    }

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
    data.append('image', formData.image);

    try {
      const res = await api.post('/banners', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Banner created successfully');
        navigate('/banners');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/banners')}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <MdArrowBack size={20} />
          </button>
          <h1 className="text-2xl font-serif font-bold text-[#064E3B]">
            Add New Banner
          </h1>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6"
        >

          {/* IMAGE UPLOAD */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center relative hover:bg-gray-50">
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
                <p className="text-xs text-gray-500 mt-2">
                  Click to change image
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <MdCloudUpload size={48} className="mb-2" />
                <p className="font-medium">Click to upload banner image</p>
                <p className="text-xs mt-1">
                  1920×700 (Hero) • 1200×300 (Middle)
                </p>
              </div>
            )}
          </div>

          {/* TEXT FIELDS */}
          <div className="grid grid-cols-1 gap-4">

            <input
              required
              placeholder="Banner Title"
              className="p-3 border rounded-lg"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <input
              placeholder="Subtitle (optional)"
              className="p-3 border rounded-lg"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            />

            <input
              placeholder="CTA Text (eg: Shop Now)"
              className="p-3 border rounded-lg"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
            />

            <input
              placeholder="Click URL (eg: /shop)"
              className="p-3 border rounded-lg"
              value={formData.click_url}
              onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-lg bg-white"
                value={formData.text_align}
                onChange={(e) => setFormData({ ...formData, text_align: e.target.value })}
              >
                <option value="left">Text Left</option>
                <option value="center">Text Center</option>
                <option value="right">Text Right</option>
              </select>

              <select
                className="p-3 border rounded-lg bg-white"
                value={formData.overlay}
                onChange={(e) => setFormData({ ...formData, overlay: e.target.value })}
              >
                <option value="dark">Dark Overlay</option>
                <option value="light">Light Overlay</option>
                <option value="none">No Overlay</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                className="p-3 border rounded-lg bg-white"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              >
                <option value="home_main">Home Main</option>
                <option value="home_middle">Home Middle</option>
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
              </select>

              <select
                className="p-3 border rounded-lg bg-white"
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
              placeholder="Sort Order"
              className="p-3 border rounded-lg"
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
            {loading ? 'Uploading…' : <><MdSave size={20} /> Save Banner</>}
          </button>

        </form>
      </div>
    </Layout>
  );
};

export default AddBanner;
