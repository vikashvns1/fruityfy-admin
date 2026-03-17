import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api,{API_BASE_URL} from '../../utils/api';
import { 
    MdAdd, MdEvent, MdTimer, MdLocalOffer, 
    MdEdit, MdDelete, MdStar, MdMoneyOff 
} from 'react-icons/md';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const BASE_URL = API_BASE_URL;

    const fetchCampaigns = async () => {
        try {
            const res = await api.get('/campaigns');
            if (res.data.success) {
                // 🔥 Sorting logic: is_featured = 1 ko top par laane ke liye
                const sortedData = [...res.data.data].sort((a, b) => b.is_featured - a.is_featured);
                setCampaigns(sortedData);
            }
        } catch (error) {
            console.error("Failed to load campaigns");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this campaign?")) return;
        try {
            await api.delete(`/campaigns/${id}`);
            toast.success("Campaign deleted successfully");
            fetchCampaigns();
        } catch (error) {
            toast.error("Failed to delete campaign");
        }
    };

    const getStatus = (camp) => {
        const now = new Date();
        const start = new Date(camp.start_date);
        const end = new Date(camp.end_date);
        
        if (!camp.is_active) return { label: 'Disabled', color: 'bg-gray-100 text-gray-500' };
        if (now > end) return { label: 'Expired', color: 'bg-red-100 text-red-600' };
        if (now < start) return { label: 'Scheduled', color: 'bg-blue-100 text-blue-600' };
        return { label: 'Live Now', color: 'bg-green-100 text-green-700 animate-pulse' };
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B] flex items-center gap-2">
                        <MdLocalOffer className="text-[#D4AF37]" /> Campaigns & Sales
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">Manage promotional banners and timers</p>
                </div>
                <Link to="/campaigns/add" className="bg-[#064E3B] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#053d2e] shadow-lg transition-all">
                    <MdAdd size={20} /> Create Campaign
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center py-20">
                        <div className="animate-spin h-8 w-8 border-2 border-[#064E3B] rounded-full border-t-transparent mx-auto"></div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="col-span-3 text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <MdEvent size={48} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No active campaigns found.</p>
                        <p className="text-gray-400 text-xs mt-1">Create a deal to boost sales.</p>
                    </div>
                ) : (
                    campaigns.map((camp) => {
                        const status = getStatus(camp);
                        const isFeatured = camp.is_featured === 1;

                        return (
                            <div 
                                key={camp.id} 
                                className={`bg-white rounded-2xl shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col relative border-2 ${isFeatured ? 'border-yellow-400' : 'border-gray-100'}`}
                            >
                                
                                {/* 🔥 Featured Star Badge (Zaruri Badge) */}
                                {isFeatured && (
                                    <div className="absolute top-0 left-0 z-20 bg-yellow-400 text-[#064E3B] px-3 py-1 rounded-br-2xl shadow-md flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider">
                                        <MdStar size={14} className="animate-spin-slow" /> Home Page Active
                                    </div>
                                )}

                                {/* Banner Preview */}
                                <div className="h-40 w-full bg-gray-100 relative overflow-hidden">
                                    {camp.banner_image ? (
                                        <img 
                                            src={`${BASE_URL}${camp.banner_image}`} 
                                            alt={camp.name} 
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-300 bg-gray-50">
                                            <MdLocalOffer size={40} />
                                        </div>
                                    )}
                                    <div className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase shadow-sm ${status.color}`}>
                                        {status.label}
                                    </div>
                                </div>
                                
                                <div className="p-5 flex-1">
                                    <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{camp.name}</h3>
                                    <p className="text-xs text-gray-500 mb-4 truncate italic">{camp.subtitle || 'No subtitle'}</p>
                                    
                                    {/* Discount Display */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg border border-orange-100 flex items-center gap-2 w-full">
                                            <MdMoneyOff size={16} />
                                            <span className="text-xs font-bold uppercase tracking-tight">
                                                {camp.discount_type === 'percentage' 
                                                    ? `${Math.round(camp.discount_value)}% OFF` 
                                                    : `AED ${camp.discount_value} OFF`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <MdTimer className="text-orange-500" size={16}/> 
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-gray-400 uppercase font-black">Valid Until</span>
                                            <span className="font-mono font-bold">{new Date(camp.end_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400 font-mono">Slug: {camp.slug}</span>
                                    <div className="flex gap-2">
                                        <Link 
                                            to={`/campaigns/edit/${camp.id}`} 
                                            className="p-2 text-blue-600 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                                        >
                                            <MdEdit size={16} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(camp.id)}
                                            className="p-2 text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            <MdDelete size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </Layout>
    );
};

export default AllCampaigns;