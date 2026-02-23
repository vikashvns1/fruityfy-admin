import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { MdCloudUpload, MdArrowBack, MdSave } from 'react-icons/md';

const AddCategory = () => {
    const navigate = useNavigate();
    const [parents, setParents] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        parent_id: '',
        description: '',
        meta_title: '',
        meta_description: '',
        is_new: 0
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch existing categories
    useEffect(() => {
        api.get('/categories').then(res => {
            if (res.data.success) setParents(res.data.data);
        });
    }, []);

    // Auto-generate slug
    const handleNameChange = (e) => {
        const name = e.target.value;
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        setFormData({ ...formData, name, slug });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
            const res = await api.post('/categories', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                toast.success("Category Created Successfully! 🍋");
                navigate('/categories');
            }
        } catch (error) {
            // Error handled by centralized api.js
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/categories')}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
                    >
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Add New Category</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Create a new section for your store</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 space-y-8">

                    {/* Section 1: Basic Info */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">General Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Category Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all placeholder-gray-400"
                                    placeholder="e.g. Exotic Fruits"
                                    value={formData.name}
                                    onChange={handleNameChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Slug</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed font-mono"
                                    value={formData.slug}
                                    readOnly
                                />
                            </div>
                            {/* NEW: CHECKBOX FOR 'NEW ARRIVAL' */}
                            <div className="flex items-center pt-8">
                                <label className="flex items-center cursor-pointer gap-3">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.is_new === 1}
                                            onChange={(e) => setFormData({ ...formData, is_new: e.target.checked ? 1 : 0 })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064E3B]"></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">Mark as "New Arrival" 🚀</span>
                                </label>
                            </div>

                            {/* Parent Category & Description */}
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Parent Category</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all appearance-none bg-white"
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">None (Main Category)</option>
                                        {parents.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Description</label>
                                <textarea
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all h-[42px] min-h-[42px] resize-none overflow-hidden"
                                    placeholder="Short description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Image Upload */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Media</h3>
                        <label className="block text-sm font-semibold text-[#064E3B] mb-2">Cover Image</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-[#064E3B] hover:bg-[#FEFCE8]/30 transition-all cursor-pointer relative group">
                            <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" />
                            {preview ? (
                                <div className="relative">
                                    <img src={preview} alt="Preview" className="h-40 object-contain rounded-lg shadow-sm" />
                                    <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                                        <span className="text-xs font-bold">Change Image</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-brand-yellow/50 p-3 rounded-full mb-3 text-[#064E3B] group-hover:scale-110 transition-transform">
                                        <MdCloudUpload size={28} />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Section 3: SEO */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Search Engine Optimization (SEO)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Meta Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all"
                                    placeholder="Title for search engines"
                                    value={formData.meta_title}
                                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Meta Description</label>
                                <textarea
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] outline-none transition-all h-24 resize-none"
                                    placeholder="Description for search results..."
                                    value={formData.meta_description}
                                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#064E3B] text-[#FEFCE8] px-8 py-3 rounded-xl text-sm font-bold hover:bg-[#053d2e] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <MdSave size={18} />
                            {loading ? 'Saving Category...' : 'Create Category'}
                        </button>
                    </div>

                </form>
            </div>
        </Layout>
    );
};

export default AddCategory;