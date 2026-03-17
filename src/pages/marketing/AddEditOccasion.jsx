import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api,{API_BASE_URL} from '../../utils/api';
import { toast } from 'react-toastify';
import { MdCloudUpload, MdSave, MdArrowBack, MdImage } from 'react-icons/md';

import { useProductSelector } from '../../hooks/useProductSelector';
import ProductSelector from '../../components/ProductSelector';

const IMAGE_BASE = API_BASE_URL;

const AddEditOccasion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    sort_order: 0,
    is_active: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [preselectedIds, setPreselectedIds] = useState([]);

  /* 🔥 shared selector */
  const selector = useProductSelector({
    preselectedIds,
    deep: true,
  });

  /* load occasion */
  useEffect(() => {
    if (!isEditMode) return;

    api.get(`/marketing/occasions/${id}`).then(res => {
      const o = res.data.data;

      setFormData({
        title: o.title,
        slug: o.slug,
        sort_order: o.sort_order || 0,
        is_active: o.is_active === 1,
      });

      if (o.image_url) setPreview(IMAGE_BASE + o.image_url);
      setPreselectedIds(o.product_ids || []);
    });
  }, [id]);

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('slug', formData.slug);
    fd.append('sort_order', formData.sort_order);
    fd.append('is_active', formData.is_active ? 1 : 0);
    fd.append(
      'product_ids',
  JSON.stringify(selector.selectedProducts.map(p => p.id))
    );
    if (image) fd.append('image', image);

    try {
      isEditMode
        ? await api.put(`/marketing/occasions/${id}`, fd)
        : await api.post('/marketing/occasions', fd);

      toast.success(isEditMode ? 'Occasion updated' : 'Occasion created');
      navigate('/marketing/occasions');
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-4">
          <MdArrowBack /> Back
        </button>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-6">

          <h1 className="text-xl font-bold text-[#064E3B]">
            {isEditMode ? 'Edit Occasion' : 'Add Occasion'}
          </h1>

          {/* image */}
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {preview ? (
              <img src={preview} className="h-40 mx-auto mb-3 object-contain" />
            ) : (
              <div className="text-gray-400 mb-3">
                <MdImage size={40} className="mx-auto" />
                No image selected
              </div>
            )}

            <label className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded cursor-pointer">
              <MdCloudUpload /> Choose Image
              <input
                type="file"
                hidden
                onChange={e => {
                  const f = e.target.files[0];
                  setImage(f);
                  setPreview(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>

          {/* basic */}
          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Occasion Title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
            <input
              className="border p-2 rounded"
              placeholder="Slug"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          {/* 🔥 reusable product selector */}
          <ProductSelector {...selector} />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
            />
            Active
          </label>

          <button className="w-full bg-[#064E3B] text-white py-2 rounded flex justify-center gap-2">
            <MdSave /> Save Occasion
          </button>

        </form>
      </div>
    </Layout>
  );
};

export default AddEditOccasion;
