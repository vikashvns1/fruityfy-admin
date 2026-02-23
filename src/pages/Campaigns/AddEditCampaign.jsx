import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import {
  MdArrowBack,
  MdSave,
  MdCloudUpload,
  MdImage
} from 'react-icons/md';

import { useProductSelector } from '../../hooks/useProductSelector';
import ProductSelector from '../../components/ProductSelector';

const IMAGE_BASE = 'http://localhost:5000';

const AddEditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    slug: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [preselectedIds, setPreselectedIds] = useState([]);

  /* 🔥 SHARED PRODUCT SELECTOR */
  const selector = useProductSelector({
    preselectedIds,
    deep: true,
  });

  /* LOAD CAMPAIGN (EDIT MODE) */
  useEffect(() => {
    if (!isEditMode) return;

    api.get(`/campaigns/${id}`).then(res => {
      const c = res.data.data;

      const formatDT = (d) =>
        d ? new Date(d).toISOString().slice(0, 16) : '';

      setFormData({
        name: c.name,
        subtitle: c.subtitle || '',
        slug: c.slug,
        start_date: formatDT(c.start_date),
        end_date: formatDT(c.end_date),
        is_active: c.is_active === 1,
      });

      if (c.banner_image) {
        setPreview(IMAGE_BASE + c.banner_image);
      }

      // 🔥 ONLY IDS (NO PRODUCTS)
      setPreselectedIds(c.product_ids || []);
    });
  }, [id]);

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('subtitle', formData.subtitle);
    fd.append('slug', formData.slug);
    fd.append('start_date', formData.start_date);
    fd.append('end_date', formData.end_date);
    fd.append('is_active', formData.is_active ? 1 : 0);

    // 🔥 SINGLE SOURCE OF TRUTH
    fd.append(
      'product_ids',
      JSON.stringify(selector.selectedProducts.map(p => p.id))
    );

    if (image) fd.append('image', image);

    try {
      isEditMode
        ? await api.put(`/campaigns/${id}`, fd)
        : await api.post('/campaigns', fd);

      toast.success(isEditMode ? 'Campaign Updated' : 'Campaign Created');
      navigate('/campaigns');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm mb-4"
        >
          <MdArrowBack /> Back
        </button>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-6"
        >
          <h1 className="text-xl font-bold text-[#064E3B]">
            {isEditMode ? 'Edit Campaign' : 'Create Campaign'}
          </h1>

          {/* IMAGE */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {preview ? (
              <img src={preview} className="h-40 mx-auto object-cover rounded" />
            ) : (
              <div className="text-gray-400">
                <MdImage size={40} className="mx-auto" />
                No banner selected
              </div>
            )}

            <label className="inline-flex items-center gap-2 mt-3 bg-gray-100 px-4 py-2 rounded cursor-pointer">
              <MdCloudUpload /> Choose Banner
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={e => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setImage(f);
                  setPreview(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>

          {/* BASIC INFO */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Campaign Name"
              className="border p-2 rounded"
              value={formData.name}
              onChange={e =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <input
              placeholder="Subtitle"
              className="border p-2 rounded"
              value={formData.subtitle}
              onChange={e =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
            />

            <input
              type="datetime-local"
              required
              className="border p-2 rounded"
              value={formData.start_date}
              onChange={e =>
                setFormData({ ...formData, start_date: e.target.value })
              }
            />

            <input
              type="datetime-local"
              required
              className="border p-2 rounded"
              value={formData.end_date}
              onChange={e =>
                setFormData({ ...formData, end_date: e.target.value })
              }
            />

            <input
              required
              placeholder="Slug"
              className="border p-2 rounded md:col-span-2"
              value={formData.slug}
              onChange={e =>
                setFormData({ ...formData, slug: e.target.value })
              }
            />
          </div>

          {/* 🔥 SHARED PRODUCT SELECTOR */}
          <ProductSelector {...selector} />

          {/* ACTIVE */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            Active
          </label>

          <button className="w-full bg-[#064E3B] text-white py-2 rounded flex justify-center gap-2">
            <MdSave /> Save Campaign
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditCampaign;
