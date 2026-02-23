import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { MdCloudUpload, MdArrowBack, MdSave, MdDelete,MdAutoFixHigh,MdShoppingBag } from 'react-icons/md';
import { Link} from 'react-router-dom';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    // Complete State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        sku: '',
        category_id: '',
        product_type: 'simple', // ⭐ Added Field
        price: '',
        purchase_price: '',
        discount_price: '',
        stock_quantity: '',
        delivery_eta: 'same_day',
        low_stock_threshold: '5',
        unit: 'kg',
        country_origin: '',
        shelf_life: '',
        short_description: '',
        full_description: '',
        nutritional_benefits: '',
        is_active: 1,
        is_featured: 0,
        is_bestseller: 0,
        is_new_arrival: 0,
        meta_title: '',
        meta_keyword: '',
        meta_description: ''
    });

    // --- IMAGE STATES ---
    const [existingImages, setExistingImages] = useState([]); // From DB
    const [newImages, setNewImages] = useState([]); // Files to upload
    const [newPreviews, setNewPreviews] = useState([]); // Blob URLs for preview

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    api.get('/categories'),
                    api.get(`/products/${id}`)
                ]);

                if (catRes.data.success) setCategories(catRes.data.data);

                if (prodRes.data.success) {
                    const data = prodRes.data.data;
                    setFormData({
                        name: data.name,
                        slug: data.slug || '',
                        sku: data.sku || '',
                        category_id: data.category_id,
                        product_type: data.product_type || 'simple', // ⭐ Fetching from DB
                        price: data.price,
                        purchase_price: data.purchase_price || '',
                        discount_price: data.discount_price || '',
                        stock_quantity: data.stock_quantity || 0,
                        delivery_eta: data.delivery_eta || 'same_day',
                        low_stock_threshold: data.low_stock_threshold || 5,
                        unit: data.unit || 'kg',
                        country_origin: data.country_origin || '',
                        shelf_life: data.shelf_life || '',
                        short_description: data.short_description || '',
                        full_description: data.full_description || '',
                        nutritional_benefits: data.nutritional_benefits || '',
                        is_active: data.is_active,
                        is_featured: data.is_featured,
                        is_bestseller: data.is_bestseller,
                        is_new_arrival: data.is_new_arrival,
                        meta_title: data.meta_title || '',
                        meta_keyword: data.meta_keyword || '',
                        meta_description: data.meta_description || ''
                    });

                    // Load Images
                    // Logic: If API returns an 'images' array (joined table), use it. 
                    // Otherwise try fetching from specific endpoint.
                    if (data.images && Array.isArray(data.images)) {
                        setExistingImages(data.images);
                    } else {
                        // Fallback call if data.images isn't populated in the main call
                        try {
                            const imgRes = await api.get(`/products/images/${id}`);
                            if(imgRes.data.success) setExistingImages(imgRes.data.data);
                        } catch (err) {
                            console.warn("Could not fetch separate images");
                        }
                    }
                }
            } catch (error) {
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // 1. Handle New File Selection
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = existingImages.length + newImages.length + files.length;

        if (totalImages > 6) {
            toast.warning("Maximum 6 images allowed.");
            return;
        }

        const newFilesList = [];
        const newUrlsList = [];

        files.forEach(file => {
            newFilesList.push(file);
            newUrlsList.push(URL.createObjectURL(file));
        });

        setNewImages([...newImages, ...newFilesList]);
        setNewPreviews([...newPreviews, ...newUrlsList]);
    };

    // 2. Remove New Image (Before Upload)
    const removeNewImage = (index) => {
        const updatedFiles = newImages.filter((_, i) => i !== index);
        const updatedPreviews = newPreviews.filter((_, i) => i !== index);
        setNewImages(updatedFiles);
        setNewPreviews(updatedPreviews);
    };

    // 3. Delete Existing Image (From Database)
    const handleDeleteExisting = async (imageId) => {
        if(!window.confirm("Delete this image permanently?")) return;
        try {
            const res = await api.delete(`/products/image/${imageId}`);
            if (res.data.success) {
                setExistingImages(existingImages.filter(img => img.id !== imageId));
                toast.success("Image deleted");
            }
        } catch (error) {
            toast.error("Failed to delete image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        
        // Append Multiple Images (Key: 'images')
        newImages.forEach((file) => {
            data.append('images', file);
        });

        try {
            const res = await api.put(`/products/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success("Product Updated Successfully!");
                navigate('/products');
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update product");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Layout><div className="p-10 text-center">Loading...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/products')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Edit Product</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Update inventory details</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
{/* PRODUCT ARCHITECTURE (⭐ NEW SECTION) */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Product Architecture</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                            <div>
                                <label className="block text-sm font-semibold text-purple-900 mb-2">Product Type</label>
                                <select 
                                    className="w-full px-4 py-2.5 text-sm border border-purple-200 rounded-lg focus:border-purple-600 outline-none bg-white font-bold text-purple-700"
                                    value={formData.product_type} 
                                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                >
                                    <option value="simple">Standard Product (Pre-made)</option>
                                    <option value="customizable">Juice Builder (User can Mix)</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-3 text-purple-600 italic text-xs">
                                {formData.product_type === 'customizable' ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <MdAutoFixHigh size={20} />
                                            <span className="font-bold">Template Mode Active</span>
                                        </div>
                                        <p>This product will act as a base for Juice Builder. Link its ingredients in the <Link to={`/mapping?productId=${id}`} state={{ from: `/products/edit/${id}` }} className="underline font-bold">Configurator</Link>.</p>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <MdShoppingBag size={20} />
                                        <p>Standard products are regular inventory items with fixed price and description.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">General Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Product Name</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Slug</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-mono" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">SKU</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none font-mono" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Category</label>
                                <select className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white" value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* PRICING & INVENTORY */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Pricing (P&L) & Stock</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Selling Price (₹)</label>
                                <input type="number" step="0.01" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-800 mb-2">Purchase Price (₹)</label>
                                <input type="number" step="0.01" className="w-full px-4 py-2.5 text-sm border border-blue-200 rounded-lg focus:border-blue-600 outline-none bg-blue-50" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-red-600 mb-2">Discount Price (₹)</label>
                                <input type="number" step="0.01" className="w-full px-4 py-2.5 text-sm border border-red-200 rounded-lg focus:border-red-600 outline-none" value={formData.discount_price} onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Stock</label>
                                <input type="number" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-orange-600 mb-2">Low Stock Alert</label>
                                <input type="number" className="w-full px-4 py-2.5 text-sm border border-orange-200 rounded-lg focus:border-orange-500 outline-none" value={formData.low_stock_threshold} onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Unit</label>
                                <select className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                    <option value="kg">kg</option>
                                    <option value="pcs">pcs</option>
                                    <option value="box">box</option>
                                    <option value="dozen">dozen</option>
                                    <option value="ml">ml</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Product Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Country of Origin</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" placeholder="e.g. India, USA" value={formData.country_origin} onChange={(e) => setFormData({ ...formData, country_origin: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Shelf Life / Storage</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" placeholder="e.g. 5 Days, Keep Refrigerated" value={formData.shelf_life} onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Short Description</label>
                                <textarea className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none h-32 resize-none" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} placeholder="Brief summary..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Nutritional Benefits</label>
                                <textarea className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none h-32 resize-none" value={formData.nutritional_benefits} onChange={(e) => setFormData({ ...formData, nutritional_benefits: e.target.value })} placeholder="e.g. High in Vitamin C, Good for digestion..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-2">Full Description</label>
                            <textarea className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none h-40 resize-none" value={formData.full_description} onChange={(e) => setFormData({ ...formData, full_description: e.target.value })} placeholder="Detailed product info..." />
                        </div>
                    </div>

                    {/* Delivery & Settings */}
                    <div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-[#064E3B] mb-3">Delivery ETA</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <label className="flex items-center gap-2 cursor-pointer border border-green-200 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition">
                                    <input type="radio" name="delivery_eta" value="same_day" checked={formData.delivery_eta === 'same_day'} onChange={(e) => setFormData({ ...formData, delivery_eta: e.target.value })} className="accent-green-600" />
                                    <span className="text-sm font-semibold text-green-700">🚀 Same Day</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer border border-blue-200 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                                    <input type="radio" name="delivery_eta" value="next_day" checked={formData.delivery_eta === 'next_day'} onChange={(e) => setFormData({ ...formData, delivery_eta: e.target.value })} className="accent-blue-600" />
                                    <span className="text-sm font-semibold text-blue-700">📦 Next Day</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer border border-yellow-200 bg-yellow-50 px-4 py-2 rounded-lg hover:bg-yellow-100 transition">
                                    <input type="radio" name="delivery_eta" value="two_to_four_days" checked={formData.delivery_eta === 'two_to_four_days'} onChange={(e) => setFormData({ ...formData, delivery_eta: e.target.value })} className="accent-yellow-500" />
                                    <span className="text-sm font-semibold text-yellow-800">⏳ 2–4 Days</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_active == 1} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })} className="accent-[#064E3B] w-4 h-4" />
                                <span className="text-sm font-medium">Active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_bestseller == 1} onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked ? 1 : 0 })} className="accent-[#064E3B] w-4 h-4" />
                                <span className="text-sm font-medium">Bestseller</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_new_arrival == 1} onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked ? 1 : 0 })} className="accent-[#064E3B] w-4 h-4" />
                                <span className="text-sm font-medium">New Arrival</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.is_featured == 1} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })} className="accent-[#064E3B] w-4 h-4" />
                                <span className="text-sm font-medium">Featured</span>
                            </label>
                        </div>
                    </div>

                    {/* NEW: Multi-Image Upload Section */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                            Product Images (Max 6)
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* 1. Existing Images from DB */}
                            {existingImages.map((img) => (
                                <div key={img.id} className="relative group h-32 border rounded-lg overflow-hidden bg-gray-50 border-gray-200">
                                    <img src={`http://localhost:5000${img.image_url}`} alt="Product" className="w-full h-full object-cover" />
                                    
                                    {/* Primary Badge */}
                                    {img.is_primary === 1 && (
                                        <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow">Main</span>
                                    )}

                                    {/* Delete Button (Overlay) */}
                                    <button 
                                        type="button"
                                        onClick={() => handleDeleteExisting(img.id)}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                        title="Delete Image"
                                    >
                                        <MdDelete size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* 2. New Previews */}
                            {newPreviews.map((url, index) => (
                                <div key={index} className="relative group h-32 border rounded-lg overflow-hidden border-blue-200 bg-blue-50">
                                    <img src={url} alt="New Upload" className="w-full h-full object-cover opacity-90" />
                                    <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded shadow">New</span>
                                    
                                    {/* Remove Button */}
                                    <button 
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-1 right-1 bg-gray-600 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors shadow-sm"
                                        title="Remove"
                                    >
                                        <MdDelete size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* 3. Upload Button (Show only if < 6 images) */}
                            {(existingImages.length + newImages.length) < 6 && (
                                <label className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#064E3B] hover:bg-green-50 transition-colors">
                                    <MdCloudUpload size={28} className="text-gray-400 mb-2 group-hover:text-[#064E3B]" />
                                    <span className="text-xs text-gray-500 font-medium">Add Images</span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageChange} 
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">
                            The first uploaded image (or the one marked Main) is the primary product image.
                        </p>
                    </div>

                    {/* SEO */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">SEO</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Meta Title</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Meta Keywords</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" placeholder="apple, organic" value={formData.meta_keyword} onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Meta Description</label>
                                <textarea className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none h-20 resize-none" value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button type="submit" disabled={submitting} className="bg-[#064E3B] text-[#FEFCE8] px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#053d2e] shadow-lg transition-all flex items-center gap-2">
                            <MdSave size={18} />
                            {submitting ? 'Saving...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default EditProduct;