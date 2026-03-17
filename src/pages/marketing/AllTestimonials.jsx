import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api ,{API_BASE_URL}from '../../utils/api';
import { MdAdd, MdDelete, MdEdit, MdStar, MdVisibility, MdVisibilityOff, MdRateReview } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllTestimonials = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const BASE_URL = API_BASE_URL;

    const fetchReviews = async () => {
        try {
            // Admin ke liye 'type=all' taaki inactive bhi fetch ho
            const res = await api.get('/marketing/testimonials?type=all');
            if (res.data.success) {
                setReviews(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load testimonials");
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await api.delete(`/marketing/testimonials/${id}`);
            toast.success("Review deleted successfully");
            fetchReviews();
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    // Helper for Stars
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <MdStar key={i} size={16} className={i < rating ? "text-yellow-400" : "text-gray-200"} />
        ));
    };

    return (
        <Layout>
            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#064E3B] flex items-center gap-2">
                        <MdRateReview className="text-[#D4AF37]" /> Testimonials
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage customer feedback & ratings</p>
                </div>
                <Link 
                    to="/marketing/testimonials/add" 
                    className="bg-[#064E3B] hover:bg-[#053d2e] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all hover:scale-105"
                >
                    <MdAdd size={20} /> Add Review
                </Link>
            </div>

            {/* --- Content Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-3 flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#064E3B]"></div>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="col-span-3 text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 mb-4">No reviews found.</p>
                        <Link to="/marketing/testimonials/add" className="text-[#064E3B] font-medium hover:underline">
                            + Add First Review
                        </Link>
                    </div>
                ) : (
                    reviews.map((item) => (
                        <div 
                            key={item.id} 
                            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden"
                        >
                            <div className="p-6 flex-1">
                                {/* Header: Image + Name + Status */}
                                <div className="flex items-center gap-4 mb-4">
                                    {/* User Image */}
                                    <div className="relative">
                                        <div className="h-14 w-14 rounded-full border-2 border-gray-100 shadow-sm overflow-hidden bg-gray-50">
                                            {item.customer_image ? (
                                                <img 
                                                    src={`${BASE_URL}${item.customer_image}`} 
                                                    alt={item.customer_name} 
                                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=User" }}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-[#064E3B] text-white text-xl font-bold">
                                                    {item.customer_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Status Dot */}
                                        <div className="absolute -bottom-1 -right-1 border-2 border-white rounded-full">
                                            {item.is_active ? (
                                                <div className="w-3.5 h-3.5 bg-green-500 rounded-full" title="Active"></div>
                                            ) : (
                                                <div className="w-3.5 h-3.5 bg-gray-400 rounded-full" title="Inactive"></div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name & Role */}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-gray-800 text-lg truncate" title={item.customer_name}>
                                            {item.customer_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                                            {item.designation || 'Verified Customer'}
                                        </p>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex mb-3">
                                    {renderStars(item.rating)}
                                </div>

                                {/* Review Text */}
                                <div className="relative">
                                    <span className="absolute -top-2 -left-1 text-4xl text-gray-200 font-serif leading-none">"</span>
                                    <p className="text-gray-600 text-sm italic leading-relaxed line-clamp-4 pl-4 relative z-10">
                                        {item.review_text}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-[10px] text-gray-400 font-mono">
                                    ID: #{item.id}
                                </span>
                                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link 
                                        to={`/marketing/testimonials/edit/${item.id}`} 
                                        className="p-2 text-blue-600 hover:bg-white hover:shadow rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <MdEdit size={18} />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(item.id)} 
                                        className="p-2 text-red-500 hover:bg-white hover:shadow rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <MdDelete size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
};

export default AllTestimonials;