import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api,{API_BASE_URL} from '../../utils/api';
import { MdAdd, MdDelete, MdEdit, MdEvent, MdLink } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllOccasions = () => {
    const [occasions, setOccasions] = useState([]);
    const [loading, setLoading] = useState(true);
    const BASE_URL = API_BASE_URL;

    const fetchOccasions = async () => {
        try {
            const res = await api.get('/marketing/occasions?type=all');
            if (res.data.success) {
                setOccasions(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load occasions");
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOccasions();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this occasion?")) return;
        try {
            await api.delete(`/marketing/occasions/${id}`);
            toast.success("Occasion deleted successfully");
            fetchOccasions();
        } catch (error) {
            toast.error("Failed to delete occasion");
        }
    };

    return (
        <Layout>
            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#064E3B] flex items-center gap-2">
                        <MdEvent className="text-[#D4AF37]" /> Occasions
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage homepage circular categories</p>
                </div>
                <Link 
                    to="/marketing/occasions/add" 
                    className="bg-[#064E3B] hover:bg-[#053d2e] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all hover:scale-105"
                >
                    <MdAdd size={20} /> Add New
                </Link>
            </div>

            {/* --- Content --- */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064E3B]"></div>
                </div>
            ) : occasions.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">No occasions found.</p>
                </div>
            ) : (
                // --- WEBSITE LIKE GRID LAYOUT ---
                // Grid-cols-5 to match website look (adjust as needed)
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {occasions.map((item) => (
                        <div 
                            key={item.id} 
                            className="group relative flex flex-col items-center p-4 rounded-xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100"
                        >
                            {/* 1. Circular Image Container */}
                            <div className="relative mb-3">
                                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                                    <img 
                                        src={`${BASE_URL}${item.image_url}`} 
                                        alt={item.title} 
                                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=IMG" }}
                                    />
                                </div>

                                {/* Status Badge (Absolute) */}
                                <div className="absolute top-0 right-0">
                                    {item.is_active ? (
                                        <div className="bg-green-500 border-2 border-white w-4 h-4 rounded-full" title="Active"></div>
                                    ) : (
                                        <div className="bg-gray-400 border-2 border-white w-4 h-4 rounded-full" title="Inactive"></div>
                                    )}
                                </div>
                                
                                {/* Order Badge (Absolute) */}
                                <div className="absolute top-0 left-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-white/20">
                                    #{item.sort_order}
                                </div>
                            </div>

                            {/* 2. Title (Like Website) */}
                            <h3 className="font-bold text-gray-800 text-center text-sm md:text-base mb-1">
                                {item.title}
                            </h3>

                            {/* 3. Link Preview */}
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 mb-3 bg-gray-50 px-2 py-0.5 rounded-full max-w-full">
                                <MdLink />
                                <span className="truncate max-w-[80px]">{item.link || "/"}</span>
                            </div>

                            {/* 4. Admin Actions (Only visible on hover or persistent) */}
                            <div className="flex gap-2 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link 
                                    to={`/marketing/occasions/edit/${item.id}`} 
                                    className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 hover:scale-110 transition-all shadow-sm"
                                    title="Edit"
                                >
                                    <MdEdit size={16} />
                                </Link>
                                <button 
                                    onClick={() => handleDelete(item.id)} 
                                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 hover:scale-110 transition-all shadow-sm"
                                    title="Delete"
                                >
                                    <MdDelete size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default AllOccasions;