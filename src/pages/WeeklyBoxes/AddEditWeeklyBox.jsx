import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api,{API_BASE_URL} from '../../utils/api';
import { toast } from 'react-toastify';
import {
  MdArrowBack,
  MdSave,
  MdCloudUpload,
  MdImage,
  MdInfo
} from 'react-icons/md';

import { useProductSelector } from '../../hooks/useProductSelector';
import ProductSelector from '../../components/ProductSelector';

const IMAGE_BASE = API_BASE_URL;

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
  const [quantities, setQuantities] = useState({});

  const selector = useProductSelector({
    preselectedIds,
    deep: true
  });

  /* ================= CALCULATIONS ================= */
  // Har item ka price * quantity karke total nikalna
  const calculateTotalValue = () => {
    return selector.selectedProducts.reduce((sum, p) => {
      const qty = quantities[p.id] || 1;
      return sum + (Number(p.price || 0) * Number(qty));
    }, 0);
  };

  const totalValue = calculateTotalValue();
  const sellingPrice = Number(formData.price || 0);
  const savings = totalValue > sellingPrice ? totalValue - sellingPrice : 0;
  const discountPercentage = totalValue > 0 ? ((savings / totalValue) * 100).toFixed(0) : 0;

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

      if (b.products) {
        const qtyMap = {};
        b.products.forEach(p => {
          qtyMap[p.id] = p.quantity || 1;
        });
        setQuantities(qtyMap);
      }

      setPreselectedIds(b.product_ids || []);
    });
  }, [id, isEditMode]);

  const handleQtyChange = (pid, val) => {
    setQuantities(prev => ({ ...prev, [pid]: val }));
  };

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

    const productData = selector.selectedProducts.map(p => ({
      id: p.id,
      quantity: quantities[p.id] || 1
    }));

    fd.append('product_ids', JSON.stringify(productData));

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
        <button onClick={() => navigate(-1)} className="flex gap-2 mb-4 text-gray-600 hover:text-black transition">
          <MdArrowBack size={20} /> Back
        </button>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-6 border border-gray-100">
          <h1 className="text-2xl font-bold text-[#064E3B] border-b pb-4">
            {isEditMode ? 'Edit Weekly Box' : 'Create New Weekly Box'}
          </h1>

          {/* IMAGE SECTION */}
          <div className="border-2 border-dashed border-gray-200 p-6 rounded-xl text-center bg-gray-50">
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} className="h-48 w-64 mx-auto mb-3 object-cover rounded-lg shadow-md" alt="Preview" />
                <button type="button" onClick={() => {setImage(null); setPreview(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs">✕</button>
              </div>
            ) : (
              <div className="text-gray-400 py-4">
                <MdImage size={48} className="mx-auto mb-2" />
                <p>Upload a high-quality box cover image</p>
              </div>
            )}
            <div className="mt-2">
              <label className="cursor-pointer inline-flex gap-2 bg-[#064E3B] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition">
                <MdCloudUpload size={18} /> Choose File
                <input type="file" hidden accept="image/*" onChange={e => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setImage(f);
                  setPreview(URL.createObjectURL(f));
                }} />
              </label>
            </div>
          </div>

          {/* BASIC INFO FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Box Title</label>
              <input className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#064E3B] outline-none" placeholder="e.g. Family Delight Box" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Subtitle</label>
              <input className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#064E3B] outline-none" placeholder="e.g. Perfect for a family of 4" value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Fruit Range</label>
              <input className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-[#064E3B] outline-none" placeholder="e.g. 8-10 seasonal fruits" value={formData.fruit_range} onChange={e => setFormData({ ...formData, fruit_range: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700">Box Selling Price (AED)</label>
              <input type="number" className="border-2 border-[#064E3B] p-3 rounded-lg w-full font-bold text-lg focus:ring-2 outline-none" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            </div>
          </div>

          {/* SHARED PRODUCT SELECTOR */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-bold text-lg text-[#064E3B]">Box Composition</h2>
              <MdInfo className="text-gray-400" title="Add products and set their quantities to see total value" />
            </div>
            
            <ProductSelector key={id || 'new-weekly-box'} {...selector} />
            
            {/* 🔥 ENHANCED TABLE: Quantity, Price, Stock & Availability */}
            {selector.selectedProducts.length > 0 && (
              <div className="mt-6 border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#064E3B] text-white">
                    <tr>
                      <th className="p-4">Fruit Name</th>
                      <th className="p-4">Availability</th>
                      <th className="p-4">Current Price</th>
                      <th className="p-4 w-32">Box Quantity</th>
                      <th className="p-4 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selector.selectedProducts.map(p => {
                      const qty = quantities[p.id] || 1;
                      const lineTotal = Number(p.price || 0) * Number(qty);
                      const isLowStock = p.stock_quantity < 10;
                      
                      return (
                        <tr key={p.id} className="hover:bg-gray-50 transition">
                          <td className="p-4 font-bold text-gray-800">{p.name}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                              {p.stock_quantity} {p.unit} left
                            </span>
                          </td>
                          <td className="p-4 text-gray-500">AED {p.price} / {p.unit}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                step="0.1"
                                className="border rounded-md w-20 px-2 py-1.5 focus:border-[#064E3B] outline-none"
                                value={qty}
                                onChange={(e) => handleQtyChange(p.id, e.target.value)}
                              />
                              <span className="text-xs text-gray-400 font-medium">{p.unit}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right font-bold text-[#064E3B]">
                            AED {lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* SUMMARY FOOTER */}
                  <tfoot className="bg-gray-50 font-bold border-t-2 border-[#064E3B]">
                    <tr>
                      <td colSpan="4" className="p-4 text-right text-gray-600 uppercase text-xs tracking-wider">Total Combined Market Value:</td>
                      <td className="p-4 text-right text-xl text-[#064E3B]">AED {totalValue.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* DISCOUNT & SAVINGS ANALYTICS */}
          {selector.selectedProducts.length > 0 && (
            <div className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between items-center gap-4 ${savings > 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${savings > 0 ? 'bg-green-500' : 'bg-orange-500'} text-white font-black text-lg`}>
                   {discountPercentage}%
                </div>
                <div>
                  <h4 className={`font-bold ${savings > 0 ? 'text-green-800' : 'text-orange-800'}`}>
                    {savings > 0 ? 'Customer Savings Detected!' : 'Price is higher than market value'}
                  </h4>
                  <p className="text-xs text-gray-600">Based on current individual product prices.</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Customer saves</p>
                <p className={`text-2xl font-black ${savings > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  AED {savings.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* OPTIONS */}
          <div className="flex flex-col sm:flex-row gap-6 bg-gray-50 p-4 rounded-xl">
            <label className="flex gap-3 items-center cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#064E3B] focus:ring-[#064E3B]" checked={formData.is_popular} onChange={e => setFormData({ ...formData, is_popular: e.target.checked })} />
              <span className="text-sm font-bold text-gray-700 group-hover:text-black">Mark as "Most Popular"</span>
            </label>

            <label className="flex gap-3 items-center cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#064E3B] focus:ring-[#064E3B]" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} />
              <span className="text-sm font-bold text-gray-700 group-hover:text-black">Active (Visible to customers)</span>
            </label>
          </div>

          <button className="w-full bg-[#064E3B] text-white py-4 rounded-xl font-bold text-lg flex justify-center gap-3 hover:bg-[#053d2e] shadow-xl hover:shadow-[#064E3B]/20 transition-all active:scale-[0.98]">
            <MdSave size={24} /> SAVE WEEKLY BOX
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default AddEditWeeklyBox;