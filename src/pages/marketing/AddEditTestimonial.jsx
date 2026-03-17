import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import api,{API_BASE_URL} from '../../utils/api';
import { toast } from 'react-toastify';
import { MdSave, MdArrowBack, MdStar, MdCloudUpload, MdPerson } from 'react-icons/md';

const AddEditTestimonial = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;
    const BASE_URL = API_BASE_URL;

    const [formData, setFormData] = useState({
        customer_name: '',
        designation: '',
        rating: 5,
        review_text: '',
        is_active: true
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- Fetch Data for Edit ---
    useEffect(() => {
        if (isEditMode) {
            const fetchData = async () => {
                try {
                    // Optimized: Fetch Single Item by ID directly
                    const res = await api.get(`/marketing/testimonials/${id}`);
                    if (res.data.success) {
                        const item = res.data.data;
                        setFormData({
                            customer_name: item.customer_name,
                            designation: item.designation || '',
                            rating: item.rating,
                            review_text: item.review_text,
                            is_active: item.is_active === 1
                        });
                        
                        // Handle Image Preview
                        if (item.customer_image) {
                            setPreview(`${BASE_URL}${item.customer_image}`);
                        }
                    }
                } catch (error) {
                    console.error("Fetch error:", error);
                    toast.error("Could not fetch details");
                    navigate('/marketing/testimonials');
                }
            };
            fetchData();
        }
    }, [id, isEditMode, navigate]);

    // --- Handlers ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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
        data.append('customer_name', formData.customer_name);
        data.append('designation', formData.designation);
        data.append('rating', formData.rating);
        data.append('review_text', formData.review_text);
        
        // Backend expects '1' or '0' for tinyint
        data.append('is_active', formData.is_active ? 1 : 0);
        
        // Image tabhi append karein jab select ki gayi ho
        if (image) {
            data.append('image', image);
        }

        try {
            // --- FIX: HEADER ADDED HERE ---
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (isEditMode) {
                // Config 3rd argument hota hai put mein
                await api.put(`/marketing/testimonials/${id}`, data, config);
                toast.success("Review Updated Successfully!");
            } else {
                // Config 3rd argument hota hai post mein
                await api.post('/marketing/testimonials', data, config);
                toast.success("Review Added Successfully!");
            }
            navigate('/marketing/testimonials');
        } catch (error) {
            console.error("Submit Error:", error);
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Helper: Star Rating Selector
    const StarRating = () => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button 
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`p-1 transition-transform hover:scale-110 focus:outline-none ${
                        star <= formData.rating ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                >
                    <MdStar size={32} />
                </button>
            ))}
        </div>
    );

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button 
                    onClick={() => navigate('/marketing/testimonials')} 
                    className="flex items-center gap-2 text-gray-500 hover:text-[#064E3B] mb-6 transition-colors group"
                >
                    <MdArrowBack className="group-hover:-translate-x-1 transition-transform" /> 
                    Back to Testimonials
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 px-8 py-6 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-[#064E3B]">
                            {isEditMode ? 'Edit Customer Review' : 'Add New Review'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Share what your customers are saying.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        
                        {/* Section 1: User Info & Image */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            
                            {/* Profile Image Upload */}
                            <div className="w-full md:w-auto flex flex-col items-center gap-3">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full border-4 border-gray-50 shadow-inner bg-gray-100 overflow-hidden flex items-center justify-center">
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <MdPerson className="text-gray-300 text-6xl" />
                                        )}
                                        
                                        {/* Overlay Hover Effect */}
                                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <MdCloudUpload size={24} />
                                            <span className="text-xs font-medium mt-1">Upload</span>
                                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">Customer Photo</span>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 w-full space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Customer Name <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        name="customer_name" 
                                        required 
                                        value={formData.customer_name} 
                                        onChange={handleChange}
                                        placeholder="e.g. John Doe"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] outline-none transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Designation / Role</label>
                                    <input 
                                        type="text" 
                                        name="designation" 
                                        value={formData.designation} 
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] outline-none transition-all"
                                        placeholder="e.g. Verified Buyer" 
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* Section 2: Rating & Review */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                                <StarRating />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Review Content <span className="text-red-500">*</span></label>
                                <textarea 
                                    name="review_text" 
                                    rows="5" 
                                    required 
                                    value={formData.review_text} 
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#064E3B]/20 focus:border-[#064E3B] outline-none transition-all resize-none"
                                    placeholder="Write the customer's feedback here..."
                                ></textarea>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 w-fit">
                                <input 
                                    type="checkbox" 
                                    name="is_active" 
                                    id="activeCheck" 
                                    checked={formData.is_active} 
                                    onChange={handleChange}
                                    className="h-5 w-5 text-[#064E3B] rounded border-gray-300 focus:ring-[#064E3B] cursor-pointer" 
                                />
                                <label htmlFor="activeCheck" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                    Visible on Website
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#064E3B] hover:bg-[#053d2e] text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/10 transition-all active:scale-[0.99] flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <MdSave size={20} />
                                        {isEditMode ? 'Update Testimonial' : 'Save Testimonial'}
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AddEditTestimonial;