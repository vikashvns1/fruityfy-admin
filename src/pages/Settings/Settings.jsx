import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import {
    MdSave, MdSettings, MdAttachMoney, MdSupportAgent,
    MdPublic, MdVerifiedUser, MdViewQuilt, MdTimer
} from 'react-icons/md';
import { toast } from 'react-toastify';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const BASE_URL = "http://localhost:5000";

    const [formData, setFormData] = useState({
        // Financials
        site_name: '', currency: 'AED',
        delivery_fee: '', free_delivery_threshold: '', tax_rate: '',
        return_window_days: '', // <--- NEW ADDED

        // Contact
        support_phone: '', support_email: '', whatsapp_number: '',
        instagram_url: '', facebook_url: '',

        // Promise Section
        promise_title: '', promise_text: '',

        // Visibility Flags (Default 1 = Visible)
        show_popup: 1, // <--- NEW ADDED
        show_hero: 1, show_features: 1, show_categories: 1, show_deal: 1, show_bestsellers: 1,
        show_occasions: 1, show_promo_banner: 1, show_new_arrivals: 1, show_brand_story: 1,
        show_trust_strip: 1, show_testimonials: 1, show_instagram: 1, show_newsletter: 1, show_shipping_banner: 1
    });

    // Image States
    const [img1, setImg1] = useState(null);
    const [img2, setImg2] = useState(null);
    const [preview1, setPreview1] = useState(null);
    const [preview2, setPreview2] = useState(null);

    // --- TOGGLE COMPONENT ---
    const Toggle = ({ label, name, checked, onChange }) => (
        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    name={name}
                    className="sr-only peer"
                    checked={checked == 1}
                    onChange={(e) => onChange({ ...formData, [name]: e.target.checked ? 1 : 0 })}
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#064E3B]"></div>
            </label>
        </div>
    );

    // 1. Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                if (res.data.success) {
                    setFormData(res.data.data);
                    if (res.data.data.promise_image_1) setPreview1(`${BASE_URL}${res.data.data.promise_image_1}`);
                    if (res.data.data.promise_image_2) setPreview2(`${BASE_URL}${res.data.data.promise_image_2}`);
                }
            } catch (error) {
                console.error("Failed to load settings");
            }
        };
        fetchSettings();
    }, []);

    // 2. Handle Image Selection
    const handleImageChange = (e, setFile, setPrev) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPrev(URL.createObjectURL(file));
        }
    };

    // 3. Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key] === null ? '' : formData[key]);
        });

        if (img1) data.append('promise_image_1', img1);
        if (img2) data.append('promise_image_2', img2);

        try {
            const res = await api.put('/settings', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success("Settings Saved Successfully!");
            }
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white rounded-lg shadow-sm text-[#064E3B]">
                    <MdSettings size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Global Settings</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage app configuration & homepage layout</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. HOMEPAGE LAYOUT CONTROL */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MdViewQuilt className="text-orange-500" /> Homepage Sections Visibility
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* New Popup Toggle */}
                        <Toggle label="Welcome Popup" name="show_popup" checked={formData.show_popup} onChange={setFormData} />
                        
                        <Toggle label="Hero Section" name="show_hero" checked={formData.show_hero} onChange={setFormData} />
                        <Toggle label="Features Strip" name="show_features" checked={formData.show_features} onChange={setFormData} />
                        <Toggle label="Categories" name="show_categories" checked={formData.show_categories} onChange={setFormData} />
                        <Toggle label="Deal of the Day" name="show_deal" checked={formData.show_deal} onChange={setFormData} />
                        <Toggle label="Best Sellers" name="show_bestsellers" checked={formData.show_bestsellers} onChange={setFormData} />
                        <Toggle label="Occasions" name="show_occasions" checked={formData.show_occasions} onChange={setFormData} />
                        <Toggle label="Promo Banner (Middle)" name="show_promo_banner" checked={formData.show_promo_banner} onChange={setFormData} />
                        <Toggle label="New Arrivals" name="show_new_arrivals" checked={formData.show_new_arrivals} onChange={setFormData} />
                        <Toggle label="Brand Story" name="show_brand_story" checked={formData.show_brand_story} onChange={setFormData} />
                        <Toggle label="Trust Strip" name="show_trust_strip" checked={formData.show_trust_strip} onChange={setFormData} />
                        <Toggle label="Testimonials" name="show_testimonials" checked={formData.show_testimonials} onChange={setFormData} />
                        <Toggle label="Instagram Feed" name="show_instagram" checked={formData.show_instagram} onChange={setFormData} />
                        <Toggle label="Newsletter" name="show_newsletter" checked={formData.show_newsletter} onChange={setFormData} />
                        <Toggle label="Shipping Banner (Footer)" name="show_shipping_banner" checked={formData.show_shipping_banner} onChange={setFormData} />
                    </div>
                </div>

                {/* 2. Financial Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MdAttachMoney className="text-[#064E3B]" /> Financials & Delivery
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Currency</label>
                                <input type="text" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
                                    value={formData.currency || ''} readOnly />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Tax Rate (%)</label>
                                <input type="number" step="0.01" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                    value={formData.tax_rate || ''}
                                    onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Delivery Fee</label>
                                <input type="number" step="0.01" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                    value={formData.delivery_fee || ''}
                                    onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Free Delivery Above</label>
                                <input type="number" step="0.01" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                    value={formData.free_delivery_threshold || ''}
                                    onChange={(e) => setFormData({ ...formData, free_delivery_threshold: e.target.value })} />
                            </div>
                        </div>
                        
                        {/* Return Window Added Here */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                <MdTimer /> Return Policy Window (Days)
                            </label>
                            <input type="number" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                value={formData.return_window_days || ''}
                                placeholder="e.g. 7"
                                onChange={(e) => setFormData({ ...formData, return_window_days: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* 3. Contact Support */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MdSupportAgent className="text-blue-600" /> Support Contact
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Support Email</label>
                            <input type="email" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                value={formData.support_email || ''}
                                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                <input type="text" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                    value={formData.support_phone || ''}
                                    onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">WhatsApp</label>
                                <input type="text" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                    value={formData.whatsapp_number || ''}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Brand Story Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MdVerifiedUser className="text-green-600" /> Homepage "Brand Story"
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                                <input type="text" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                    value={formData.promise_title || ''}
                                    onChange={(e) => setFormData({ ...formData, promise_title: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Story Text</label>
                                <textarea rows="4" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                    value={formData.promise_text || ''}
                                    onChange={(e) => setFormData({ ...formData, promise_text: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Left Image</label>
                                <div className="h-28 w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative bg-gray-50">
                                    {preview1 ? <img src={preview1} alt="Preview" className="h-full w-full object-cover" /> : <span className="text-gray-400 text-xs">No Image</span>}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageChange(e, setImg1, setPreview1)} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Right Image</label>
                                <div className="h-28 w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden relative bg-gray-50">
                                    {preview2 ? <img src={preview2} alt="Preview" className="h-full w-full object-cover" /> : <span className="text-gray-400 text-xs">No Image</span>}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleImageChange(e, setImg2, setPreview2)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Social Media */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <MdPublic className="text-purple-600" /> Social Media Links
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                            placeholder="Instagram URL" value={formData.instagram_url || ''}
                            onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })} />
                        <input type="text" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                            placeholder="Facebook URL" value={formData.facebook_url || ''}
                            onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })} />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="lg:col-span-2 flex justify-end">
                    <button type="submit" disabled={loading} className="bg-[#064E3B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#053d2e] flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                        {loading ? 'Saving...' : <><MdSave size={20} /> Save Global Settings</>}
                    </button>
                </div>

            </form>
        </Layout>
    );
};

export default Settings;