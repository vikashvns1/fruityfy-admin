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
    discount_type: 'percentage', // 🔥 Added for logic
    discount_value: 0,
    is_featured: false,     // 🔥 Added for logic
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [preselectedIds, setPreselectedIds] = useState([]);

  /* 🔥 SHARED PRODUCT SELECTOR */
  const selector = useProductSelector({
    preselectedIds,
    deep: true,
  });

  // 🔥 AUTO SLUG GENERATION
  useEffect(() => {
    if (!isEditMode && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
        .replace(/(^-|-$)+/g, '');    // remove leading/trailing hyphens
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isEditMode]);

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
        discount_type: c.discount_type || 'percentage', // 🔥 Load from DB
        discount_value: c.discount_value || 0,
        is_featured: c.is_featured === 1,     // 🔥 Load from DB
      });

      if (c.banner_image) {
        setPreview(IMAGE_BASE + c.banner_image);
      }

      setPreselectedIds(c.product_ids || []);
    });
  }, [id]);

  /* SUBMIT */
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const fd = new FormData();
  //   fd.append('name', formData.name);
  //   fd.append('subtitle', formData.subtitle);
  //   fd.append('slug', formData.slug);
  //   fd.append('start_date', formData.start_date);
  //   fd.append('end_date', formData.end_date);
  //   fd.append('is_active', formData.is_active ? 1 : 0);
  //   fd.append('discount_type', formData.discount_type);   // 🔥 Send to API
  //   fd.append('discount_value', formData.discount_value); // 🔥 Send to API

  //   fd.append(
  //     'product_ids',
  //     JSON.stringify(selector.selectedProducts.map(p => p.id))
  //   );

  //   if (image) fd.append('image', image);

  //   try {
  //     isEditMode
  //       ? await api.put(`/campaigns/${id}`, fd)
  //       : await api.post('/campaigns', fd);

  //     toast.success(isEditMode ? 'Campaign Updated' : 'Campaign Created');
  //     navigate('/campaigns');
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Failed');
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // form fields append
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));

    // products append
    data.append(
      "product_ids",
      JSON.stringify(selector.selectedProducts.map(p => p.id))
    );

    // image append
    if (image) data.append("image", image);

    try {

      const res = isEditMode
        ? await api.put(`/campaigns/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        })
        : await api.post(`/campaigns`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });

      if (res.data.success) {
        toast.success(isEditMode ? "Campaign Updated" : "Campaign Created");
        navigate("/campaigns");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
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

          {/* IMAGE SECTION */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {preview ? (
              <img src={preview} className="h-40 mx-auto object-cover rounded" />
            ) : (
              <div className="text-gray-400">
                <MdImage size={40} className="mx-auto" />
                No banner selected
              </div>
            )}

            <label className="inline-flex items-center gap-2 mt-3 bg-gray-100 px-4 py-2 rounded cursor-pointer hover:bg-gray-200 transition">
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
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Campaign Name</label>
              <input
                required
                placeholder="Ex: Summer Sale"
                className="border p-2 rounded focus:ring-2 focus:ring-[#064E3B] outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Slug (Auto-generated)</label>
              <input
                required
                placeholder="slug-url"
                className="border p-2 rounded bg-gray-50 outline-none"
                value={formData.slug}
                readOnly={!isEditMode} // Edit mode me change kar sakte hain, naye me auto
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-600">Subtitle</label>
              <input
                placeholder="Ex: Get 20% OFF on all fruits"
                className="border p-2 rounded focus:ring-2 focus:ring-[#064E3B] outline-none"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            {/* 🔥 DISCOUNT SECTION */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Discount Type</label>
              <select
                className="border p-2 rounded outline-none"
                value={formData.discount_type}
                onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (AED)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Discount Value</label>
              <input
                type="number"
                required
                placeholder="0.00"
                className="border p-2 rounded outline-none"
                value={formData.discount_value}
                onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">Start Date</label>
              <input
                type="datetime-local"
                required
                className="border p-2 rounded outline-none"
                value={formData.start_date}
                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-600">End Date</label>
              <input
                type="datetime-local"
                required
                className="border p-2 rounded outline-none"
                value={formData.end_date}
                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* 🔥 SHARED PRODUCT SELECTOR */}
          <div className="border-t pt-4">
            <h2 className="text-sm font-bold text-gray-700 mb-2">Select Products for this Campaign</h2>
            <ProductSelector {...selector} />
          </div>

          {/* ACTIVE & SUBMIT */}
          <div className="flex items-center justify-between border-t pt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#064E3B]"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span className="font-bold text-gray-700">Set as Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-orange-50 p-3 rounded-xl border border-orange-200">
              <input
                type="checkbox"
                className="w-4 h-4 accent-orange-600"
                checked={formData.is_featured}
                onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
              />
              <span className="font-bold text-orange-800 text-sm">Show on Home Page (Deal of the Day)</span>
            </label>
            <button className="bg-[#064E3B] hover:bg-[#053d2e] text-white px-8 py-2.5 rounded-lg flex items-center gap-2 font-bold shadow-lg transition-all">
              <MdSave size={20} /> Save Campaign
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditCampaign;