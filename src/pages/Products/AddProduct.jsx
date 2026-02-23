import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { MdCloudUpload, MdArrowBack, MdSave, MdDelete, MdAutoFixHigh, MdShoppingBag } from "react-icons/md";
import { Link } from "react-router-dom";

const AddProduct = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);

    // ditto same fields as Edit Product
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        sku: "",
        category_id: "",
        product_type: "simple",
        price: "",
        purchase_price: "",
        discount_price: "",
        stock_quantity: "0",
        delivery_eta: "same_day",
        low_stock_threshold: "5",
        unit: "kg",
        country_origin: "",
        shelf_life: "",
        short_description: "",
        full_description: "",
        nutritional_benefits: "",
        is_active: 1,
        is_featured: 0,
        is_bestseller: 0,
        is_new_arrival: 1,
        meta_title: "",
        meta_keyword: "",
        meta_description: ""
    });

    const [images, setImages] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // ---------- LOAD CATEGORIES ----------
    useEffect(() => {
        api.get("/categories")
            .then(res => {
                if (res.data.success) setCategories(res.data.data);
            })
            .catch(() => toast.error("Failed to load categories"));
    }, []);

    // ---------- GENERATORS ----------
    const generateSlug = (name) =>
        name.toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");

    const generateSKU = (catId, productName) => {
        const category = categories.find(c => c.id.toString() === catId.toString());
        const prefix = category ? category.name.substring(0, 3).toUpperCase() : "PROD";
        const namePart = productName ? productName.substring(0, 3).toUpperCase() : "XXX";
        const randomPart = Math.floor(100 + Math.random() * 900);
        return `${prefix}-${namePart}-${randomPart}`;
    };

    // ---------- IMAGE HANDLING ----------
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 6) {
            toast.warning("Maximum 6 images allowed");
            return;
        }
        setImages([...images, ...files]);
        setPreviews([
            ...previews,
            ...files.map(f => URL.createObjectURL(f))
        ]);
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    // ---------- SUBMIT ----------
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category_id) return toast.error("Please select a category");

        setSubmitting(true);
        const data = new FormData();
        Object.entries(formData).forEach(([k, v]) => data.append(k, v));
        images.forEach(f => data.append("images", f));

        try {
            const res = await api.post("/products", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                toast.success("Product created successfully");
                const newId = res.data.data?.insertId;
                if (formData.product_type === 'customizable') {
                    // Seedhe Mapping page par bhejo aur 'from' state mein All Products ka path do
                    navigate(`/mapping?productId=${newId}`, { state: { from: '/products' } });
                } else {
                    navigate('/products');
                }

            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Create failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                {/* HEADER */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate("/products")} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Add Product</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Create new inventory item</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
                    {/* PRODUCT ARCHITECTURE (⭐ NEW SECTION) */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Product Architecture</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                            <div>
                                <label className="block text-sm font-semibold text-purple-900 mb-2">Product Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-2.5 text-sm border border-purple-200 rounded-lg focus:border-purple-600 outline-none bg-white font-bold text-purple-700"
                                        value={formData.product_type}
                                        onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                                    >
                                        <option value="simple">Standard Product (Pre-made)</option>
                                        <option value="customizable">Juice Builder (User can Mix)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-purple-600 italic text-xs">
                                {formData.product_type === 'customizable' ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <MdAutoFixHigh size={24} className="animate-pulse" />
                                            <span className="font-bold text-purple-800">Template Mode Active</span>
                                        </div>
                                        <p className="text-purple-600">
                                            Selection makes this a <b>Template</b>. You will be automatically redirected to
                                            the <b>Juice Configurator</b> to map ingredients after you click Publish.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <MdShoppingBag size={24} />
                                        <p>Standard products are sold as-is with fixed ingredients and price.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                    {/* GENERAL INFO */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">General Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Product Name</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none"
                                    value={formData.name}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, name: val, slug: generateSlug(val) });
                                    }} required />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Slug</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-mono" value={formData.slug} readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">SKU / Batch Code (Auto)</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono font-bold" value={formData.sku} placeholder="Select Category First" readOnly />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Category</label>
                                <select className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white"
                                    value={formData.category_id}
                                    onChange={(e) => {
                                        const catId = e.target.value;
                                        setFormData({ ...formData, category_id: catId, sku: generateSKU(catId, formData.name) });
                                    }} required>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* PRICING (P&L) & STOCK */}
                    <section>
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
                    </section>

                    {/* PRODUCT DETAILS */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Product Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Country of Origin</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" placeholder="e.g. India, UAE" value={formData.country_origin} onChange={(e) => setFormData({ ...formData, country_origin: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Shelf Life / Storage</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" placeholder="e.g. 2 Days, Keep refrigerated" value={formData.shelf_life} onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Short Description</label>
                                <textarea className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none h-24 resize-none" value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} placeholder="Brief summary..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Nutritional Benefits</label>
                                <textarea className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none h-24 resize-none" value={formData.nutritional_benefits} onChange={(e) => setFormData({ ...formData, nutritional_benefits: e.target.value })} placeholder="High in Vitamin C..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-2">Full Description</label>
                            <textarea className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none h-32 resize-none" value={formData.full_description} onChange={(e) => setFormData({ ...formData, full_description: e.target.value })} placeholder="Detailed product info..." />
                        </div>
                    </section>

                    {/* DELIVERY & FLAGS */}
                    <section className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#064E3B] mb-3">Delivery ETA</label>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {[["same_day", "🚀 Same Day", "green"], ["next_day", "📦 Next Day", "blue"], ["2-4_days", "⏳ 2-4 Days", "yellow"]].map(([val, label, col]) => (
                                    <label key={val} className={`flex items-center gap-2 cursor-pointer border border-${col}-200 bg-${col}-50 px-4 py-2 rounded-lg hover:bg-${col}-100 transition`}>
                                        <input type="radio" name="delivery_eta" value={val} checked={formData.delivery_eta === val} onChange={(e) => setFormData({ ...formData, delivery_eta: e.target.value })} className={`accent-${col}-600`} />
                                        <span className={`text-sm font-semibold text-${col}-700`}>{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            {[["is_active", "Active"], ["is_bestseller", "Bestseller"], ["is_new_arrival", "New Arrival"], ["is_featured", "Featured"]].map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData[key] == 1} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked ? 1 : 0 })} className="accent-[#064E3B] w-4 h-4" />
                                    <span className="text-sm font-medium">{label}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* IMAGES SELECTION */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Product Images (Max 6)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {previews.map((url, index) => (
                                <div key={index} className="relative group h-32 border rounded-lg overflow-hidden border-blue-200 bg-blue-50 transition-all">
                                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                                    <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded shadow">{index === 0 ? "Main" : "Side"}</div>
                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MdDelete size={14} />
                                    </button>
                                </div>
                            ))}
                            {images.length < 6 && (
                                <label className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#064E3B] hover:bg-green-50 transition-all group">
                                    <MdCloudUpload size={24} className="text-gray-400 group-hover:text-[#064E3B]" />
                                    <span className="text-[10px] text-gray-500 font-bold mt-1 tracking-tight">ADD MEDIA</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </section>

                    {/* SEO SECTION */}
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">SEO (Meta Tags)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Meta Title</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" value={formData.meta_title} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Meta Keywords</label>
                                <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none" placeholder="mango, fresh, dubai" value={formData.meta_keyword} onChange={(e) => setFormData({ ...formData, meta_keyword: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Meta Description</label>
                                <textarea className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none h-20 resize-none" value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button type="submit" disabled={submitting} className="bg-[#064E3B] text-white px-10 py-3 rounded-xl text-sm font-bold hover:bg-[#053d2e] shadow-lg transition-all flex items-center gap-2">
                            <MdSave size={18} />
                            {submitting ? "Publishing..." : "Publish Product"}
                        </button>
                    </div>

                </form>
            </div>
        </Layout>
    );
};

export default AddProduct;