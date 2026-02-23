import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdArrowBack, MdSave, MdLockReset, MdPerson, MdCake, MdPinDrop, MdLanguage, MdNotifications } from 'react-icons/md';

const EditCustomer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        is_active: 1,
        password: '',
        // New Fields
        dob: '',
        pincode: '',
        gender: '',
        preferred_language: 'en',
        is_newsletter_subscribed: 0
    });

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const res = await api.get(`/customers/${id}`);
                if (res.data.success) {
                    const data = res.data.data;
                    
                    // Format Date for Input (YYYY-MM-DD)
                    let formattedDob = '';
                    if (data.dob) {
                        const d = new Date(data.dob);
                        formattedDob = d.toISOString().split('T')[0];
                    }

                    setFormData({
                        full_name: data.full_name || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        is_active: data.is_active,
                        password: '', // Always empty initially
                        dob: formattedDob,
                        pincode: data.pincode || '',
                        gender: data.gender || '',
                        preferred_language: data.preferred_language || 'en',
                        is_newsletter_subscribed: data.is_newsletter_subscribed || 0
                    });
                }
            } catch (error) {
                toast.error("Failed to load customer");
                navigate('/customers');
            } finally {
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                is_active: parseInt(formData.is_active),
                is_newsletter_subscribed: formData.is_newsletter_subscribed ? 1 : 0
            };

            const res = await api.put(`/customers/${id}`, payload);
            if (res.data.success) {
                toast.success("Customer Profile Updated Successfully!");
                navigate('/customers');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Failed to update customer";
            toast.error(errorMsg);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/customers')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Edit Customer</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Update personal details and settings</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-8">
                    
                    {/* 1. Basic Info */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <MdPerson size={18} className="text-[#064E3B]"/> Personal Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Email Address</label>
                                <input 
                                    type="email" 
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone Number</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Account Status</label>
                                <select 
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white"
                                    value={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: parseInt(e.target.value)})}
                                >
                                    <option value={1}>Active</option>
                                    <option value={0}>Blocked</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 2. Additional Info (New Fields) */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <MdCake size={18} className="text-[#064E3B]"/> Profile Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Date of Birth</label>
                                <input 
                                    type="date" 
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none text-gray-600"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Gender</label>
                                <select 
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Pincode / Zip</label>
                                <div className="relative">
                                    <MdPinDrop className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-9 p-2.5 border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none"
                                        placeholder="e.g. 12345"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Preferences */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <MdLanguage size={18} className="text-[#064E3B]"/> Preferences
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Preferred Language</label>
                                <select 
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white"
                                    value={formData.preferred_language}
                                    onChange={(e) => setFormData({...formData, preferred_language: e.target.value})}
                                >
                                    <option value="en">English</option>
                                    <option value="ar">Arabic</option>
                                </select>
                            </div>
                            <div className="flex items-center h-full pt-6">
                                <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg w-full transition-colors border border-transparent hover:border-gray-100">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            className="peer sr-only"
                                            checked={formData.is_newsletter_subscribed}
                                            onChange={(e) => setFormData({...formData, is_newsletter_subscribed: e.target.checked ? 1 : 0})}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#064E3B]"></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <MdNotifications className="text-gray-400"/> Subscribe to Newsletter
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 4. Password Reset */}
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                        <h3 className="font-bold text-orange-800 mb-4 flex items-center gap-2">
                            <MdLockReset /> Security
                        </h3>
                        <div>
                            <label className="text-xs font-bold text-orange-700 uppercase block mb-2">Reset Password</label>
                            <input 
                                type="text" 
                                placeholder="Enter new password to reset (leave empty to keep current)"
                                className="w-full p-3 border border-orange-200 rounded-lg outline-none focus:border-orange-500 bg-white"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <p className="text-xs text-orange-600/80 mt-2">
                                Note: Changing the password will log the user out from all active sessions.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button type="submit" className="bg-[#064E3B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#053d2e] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
                            <MdSave size={20} /> Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </Layout>
    );
};

export default EditCustomer;