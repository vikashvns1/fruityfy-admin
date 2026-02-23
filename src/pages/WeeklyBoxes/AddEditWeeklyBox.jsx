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

const AddEditWeeklyBox = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    fruit_range: '',
    price: '',
    is_popular: false,
    is_active: true
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [preselectedIds, setPreselectedIds] = useState([]);

  /* 🔥 shared selector (SAME AS CAMPAIGN / OCCASION) */
  const selector = useProductSelector({
    preselectedIds,
    deep: true
  });

  /* ================= LOAD (EDIT MODE) ================= */
  useEffect(() => {
    if (!isEditMode) return;

    api.get(`/weeklyBox/${id}`).then(res => {
      const b = res.data.data;

      setFormData({
        title: b.title || '',
        subtitle: b.subtitle || '',
        fruit_range: b.fruit_range || '',
        price: b.price || '',
        is_popular: b.is_popular === 1,
        is_active: b.is_active === 1
      });

      if (b.image) {
        setPreview(IMAGE_BASE + b.image);
      }

      // 🔥 IMPORTANT: ONLY IDS
      setPreselectedIds(b.product_ids || []);
    });
  }, [id, isEditMode]);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    fd.append('title', formData.title);
    fd.append('subtitle', formData.subtitle);
    fd.append('fruit_range', formData.fruit_range);
    fd.append('price', Number(formData.price));
    fd.append('is_popular', formData.is_popular ? 1 : 0);
    fd.append('is_active', formData.is_active ? 1 : 0);

    // 🔥 SINGLE SOURCE OF TRUTH
    fd.append(
      'product_ids',
      JSON.stringify(selector.selectedProducts.map(p => p.id))
    );

    if (image) fd.append('image', image);

    try {
      if (isEditMode) {
        await api.put(`/weeklyBox/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Weekly box updated');
      } else {
        await api.post('/weeklyBox', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Weekly box created');
      }

      navigate('/weekly-boxes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex gap-2 mb-4">
          <MdArrowBack /> Back
        </button>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-6"
        >
          <h1 className="text-xl font-bold text-[#064E3B]">
            {isEditMode ? 'Edit Weekly Box' : 'Add Weekly Box'}
          </h1>

          {/* IMAGE */}
          <div className="border-2 border-dashed p-4 rounded text-center">
            {preview ? (
              <img src={preview} className="h-40 mx-auto mb-3 object-cover" />
            ) : (
              <div className="text-gray-400">
                <MdImage size={40} className="mx-auto" />
                No image selected
              </div>
            )}

            <label className="cursor-pointer inline-flex gap-2 bg-gray-100 px-4 py-2 rounded">
              <MdCloudUpload /> Upload Image
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

          {/* FIELDS */}
          <input
            className="border p-2 rounded w-full"
            placeholder="Box Title"
            value={formData.title}
            onChange={e =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Subtitle"
            value={formData.subtitle}
            onChange={e =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Fruit Range (e.g. 6–8 fruits)"
            value={formData.fruit_range}
            onChange={e =>
              setFormData({ ...formData, fruit_range: e.target.value })
            }
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Price"
            value={formData.price}
            onChange={e =>
              setFormData({ ...formData, price: e.target.value })
            }
          />

          {/* 🔥 SHARED PRODUCT SELECTOR */}
          <ProductSelector
            key={id || 'new-weekly-box'}
            {...selector}
          />

          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
            />
            Active
          </label>

          <button className="w-full bg-[#064E3B] text-white py-3 rounded flex justify-center gap-2">
            <MdSave /> Save Weekly Box
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditWeeklyBox;
