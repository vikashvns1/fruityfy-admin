import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { MdAdd, MdEvent, MdTimer, MdLocalOffer, MdEdit, MdDelete } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const BASE_URL = "http://localhost:5000";

    // 1. Fetch Campaigns
    const fetchCampaigns = async () => {
        try {
            const res = await api.get('/campaigns');
            if (res.data.success) {
                setCampaigns(res.data.data);
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

    // 2. Delete Campaign Handler
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this campaign?")) return;
        try {
            // Note: Make sure backend has DELETE route enabled
            // If not, you might need to add it, but usually standard CRUD has it.
            // Assuming: router.delete('/:id', ...)
            await api.delete(`/campaigns/${id}`); // Aapko backend me delete route add karna pad sakta hai agar nahi hai
            toast.success("Campaign deleted successfully");
            fetchCampaigns(); // Refresh list
        } catch (error) {
            toast.error("Failed to delete campaign");
        }
    };

    // Helper: Check status
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
                        <p className="text-gray-400 text-xs mt-1">Create a "Summer Sale" or "Flash Deal" to boost sales.</p>
                    </div>
                ) : (
                    campaigns.map((camp) => {
                        const status = getStatus(camp);
                        return (
                            <div key={camp.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300 flex flex-col">
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
                                    
                                    {/* Status Badge */}
                                    <div className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase shadow-sm ${status.color}`}>
                                        {status.label}
                                    </div>
                                </div>
                                
                                {/* Info Body */}
                                <div className="p-5 flex-1">
                                    <h3 className="font-bold text-lg text-gray-800 truncate mb-1">{camp.name}</h3>
                                    <p className="text-xs text-gray-500 mb-4 truncate">{camp.subtitle || 'No description provided'}</p>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 mb-4">
                                        <MdTimer className="text-orange-500" size={16}/> 
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">Ends On</span>
                                            <span className="font-mono font-medium">{new Date(camp.end_date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* --- ACTION BUTTONS (Edit & Delete) --- */}
                                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400 font-mono">ID: {camp.id}</span>
                                    
                                    <div className="flex gap-2">
                                        <Link 
                                            to={`/campaigns/edit/${camp.id}`} 
                                            className="p-2 text-blue-600 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-sm"
                                            title="Edit Campaign"
                                        >
                                            <MdEdit size={16} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(camp.id)}
                                            className="p-2 text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
                                            title="Delete Campaign"
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