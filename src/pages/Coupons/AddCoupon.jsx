import { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdArrowBack, MdSave, MdLocalOffer } from 'react-icons/md';

const AddCoupon = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_amount: 0,
        expiry_date: '',
        usage_limit: 100
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/coupons', formData);
            if (res.data.success) {
                toast.success("Coupon created successfully!");
                navigate('/coupons');
            }
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/coupons')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <MdArrowBack size={20} />
                    </button>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Create Coupon</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code</label>
                        <div className="relative">
                            <MdLocalOffer className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text" required
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B] uppercase font-mono tracking-wider"
                                placeholder="e.g. SUMMER2026"
                                value={formData.code}
                                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Type</label>
                            <select 
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B] bg-white"
                                value={formData.discount_type}
                                onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (AED)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Value</label>
                            <input 
                                type="number" required
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                placeholder="e.g. 10"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                            <input 
                                type="datetime-local" required
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Usage Limit</label>
                            <input 
                                type="number"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                value={formData.usage_limit}
                                onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Min Order Amount (AED)</label>
                        <input 
                            type="number"
                            className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                            placeholder="0 for no minimum"
                            value={formData.min_order_amount}
                            onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-[#064E3B] text-white py-3 rounded-xl font-bold hover:bg-[#053d2e] flex items-center justify-center gap-2 shadow-lg">
                        {loading ? 'Creating...' : <><MdSave size={20} /> Create Coupon</>}
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default AddCoupon;