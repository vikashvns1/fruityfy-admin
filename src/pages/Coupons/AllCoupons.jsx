import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { MdAdd, MdDelete, MdContentCopy, MdToggleOn, MdToggleOff } from 'react-icons/md'; // Added Toggle Icons
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCoupons = async () => {
        try {
            const res = await api.get('/coupons');
            if (res.data.success) setCoupons(res.data.data);
        } catch (error) {
            console.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // --- NEW: HANDLE STATUS TOGGLE ---
    const handleToggleStatus = async (id, currentStatus) => {
        try {
            // Optimistic UI Update (Update UI instantly before API responds)
            const updatedCoupons = coupons.map(c => 
                c.id === id ? { ...c, is_active: currentStatus === 1 ? 0 : 1 } : c
            );
            setCoupons(updatedCoupons);

            // Call API
            const res = await api.patch(`/coupons/${id}/status`);
            
            if (res.data.success) {
                toast.success(`Coupon ${currentStatus === 1 ? 'Deactivated' : 'Activated'}`);
            } else {
                // Revert if API fails
                fetchCoupons(); 
                toast.error("Failed to update status");
            }
        } catch (error) {
            fetchCoupons(); // Revert
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try {
            await api.delete(`/coupons/${id}`);
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch (error) {
            toast.error("Failed to delete coupon");
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        toast.info("Code copied!");
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Coupons</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Manage discount codes</p>
                </div>
                <Link to="/coupons/add" className="bg-[#064E3B] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#053d2e] transition-colors">
                    <MdAdd size={20} /> Create Coupon
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="p-4">Code</th>
                            <th className="p-4">Discount</th>
                            <th className="p-4">Usage</th>
                            <th className="p-4">Expires</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No coupons found.</td></tr>
                        ) : (
                            coupons.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <button 
                                            onClick={() => copyToClipboard(c.code)}
                                            className="font-mono font-bold text-[#064E3B] bg-green-50 px-2 py-1 rounded border border-green-100 flex items-center gap-2 hover:bg-green-100"
                                        >
                                            {c.code} <MdContentCopy size={12} className="text-green-600"/>
                                        </button>
                                    </td>
                                    <td className="p-4 font-medium">
                                        {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `AED ${c.discount_value} OFF`}
                                        <div className="text-[10px] text-gray-400">Min Order: AED {c.min_order_amount}</div>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {c.used_count} / {c.usage_limit} used
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        {new Date(c.expiry_date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        {/* Status Toggle Logic */}
                                        {new Date(c.expiry_date) < new Date() ? (
                                            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">Expired</span>
                                        ) : (
                                            <button 
                                                onClick={() => handleToggleStatus(c.id, c.is_active)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                                                    c.is_active 
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                            >
                                                {c.is_active ? 'Active' : 'Inactive'}
                                                {/* Visual Icon for Toggle */}
                                                {c.is_active ? <MdToggleOn size={20} className="text-green-600"/> : <MdToggleOff size={20} className="text-gray-400"/>}
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(c.id)}
                                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded"
                                            title="Delete Coupon"
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

export default AllCoupons;