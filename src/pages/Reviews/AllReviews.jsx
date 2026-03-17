import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api,{API_BASE_URL} from '../../utils/api';
import { MdStar, MdDelete, MdImageNotSupported } from 'react-icons/md';
import { toast } from 'react-toastify';

const AllReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Reviews (Use the admin endpoint to get images)
    const fetchReviews = async () => {
        try {
            const res = await api.get('/reviews');
            if (res.data.success) {
                setReviews(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load reviews");
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // 2. Handle Status Update
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            // Optimistic Update: Update UI immediately
            setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));

            // Call API (Using PATCH as per backend setup)
            await api.patch(`/reviews/${id}/status`, { status: newStatus });
            toast.success(`Review updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
            fetchReviews(); // Revert on error
        }
    };

    // 3. Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await api.delete(`/reviews/${id}`);
            toast.success("Review deleted");
            fetchReviews();
        } catch (error) {
            toast.error("Failed to delete review");
        }
    };

    // Helper to render star rating
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <MdStar key={i} size={14} className={i < rating ? "text-orange-400" : "text-gray-200"} />
        ));
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Customer Reviews</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Moderate product feedback</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Rating</th>
                            <th className="p-4 w-1/3">Comment</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading reviews...</td></tr>
                        ) : reviews.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-400">No reviews found yet.</td></tr>
                        ) : (
                            reviews.map((review) => (
                                <tr key={review.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-xs text-gray-500 font-mono">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </td>

                                    {/* --- NEW: Product Image & Name --- */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                                {review.product_image ? (
                                                    <img
                                                        src={`${API_BASE_URL}${review.product_image}`}
                                                        alt={review.product_name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <MdImageNotSupported className="text-gray-400" />
                                                )}
                                            </div>
                                            <span className="font-medium text-[#064E3B] line-clamp-2" title={review.product_name}>
                                                {review.product_name}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="p-4">
                                        {review.customer_name || review.user_name || 'Anonymous'}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex">
                                            {renderStars(review.rating)}
                                        </div>
                                    </td>
                                    {/* Comment & Review Images Column */}
                                    <td className="p-4">
                                        <div className="flex flex-col gap-2">
                                            <p className="text-xs text-gray-600 italic leading-relaxed">
                                                "{review.comment}"
                                            </p>

                                            {/* REVIEW IMAGES GALLERY */}
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {review.images.map((imgUrl, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="group relative h-12 w-12 rounded-md border border-gray-200 overflow-hidden bg-gray-50 cursor-zoom-in"
                                                            onClick={() => window.open(`${API_BASE_URL$}${imgUrl}`, '_blank')}
                                                        >
                                                            <img
                                                                src={`${API_BASE_URL}${imgUrl}`}
                                                                alt={`Review ${idx}`}
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                            />
                                                            {/* Hover Overlay */}
                                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* --- NEW: Status Dropdown --- */}
                                    <td className="p-4">
                                        <select
                                            value={review.status}
                                            onChange={(e) => handleStatusUpdate(review.id, e.target.value)}
                                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase border outline-none cursor-pointer ${review.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    review.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                                                }`}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                    </td>

                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors"
                                            title="Delete Review"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AllReviews;