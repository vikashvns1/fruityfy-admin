import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdArrowBack, MdSave, MdCheckBox, MdCheckBoxOutlineBlank, MdSecurity, MdLockReset } from 'react-icons/md';

const EditStaff = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: 'manager',
        permissions: [],
        password: '' // Optional for reset
    });

    const permissionOptions = [
        { id: 'dashboard', label: 'View Dashboard' },
        { id: 'orders', label: 'Manage Orders' },
        { id: 'products', label: 'Manage Products' },
        { id: 'customers', label: 'Manage Customers' },
        { id: 'staff', label: 'Manage Staff' }
    ];

    // Fetch existing data
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await api.get(`/staff/${id}`);
                if (res.data.success) {
                    setFormData(prev => ({ ...prev, ...res.data.data, password: '' }));
                }
            } catch (error) {
                toast.error("Failed to load staff data");
                navigate('/staff');
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, [id, navigate]);

    const togglePermission = (permId) => {
        setFormData(prev => {
            const current = prev.permissions;
            if (current.includes(permId)) {
                return { ...prev, permissions: current.filter(p => p !== permId) };
            } else {
                return { ...prev, permissions: [...current, permId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/staff/${id}`, formData);
            if (res.data.success) {
                toast.success("Staff member updated!");
                navigate('/staff');
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    if (loading) return <Layout>Loading...</Layout>;

    return (
        <Layout title="Edit Staff Member" subtitle="Update role, permissions or password">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/staff')} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#064E3B]">
                    <MdArrowBack /> Back to List
                </button>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input type="text" required className="w-full p-3 border border-gray-200 rounded-lg"
                                value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <input type="email" required className="w-full p-3 border border-gray-200 rounded-lg"
                                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                            <input type="text" className="w-full p-3 border border-gray-200 rounded-lg"
                                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>

                    {/* Password Reset Section */}
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                            <MdLockReset /> Reset Password
                        </h4>
                        <input 
                            type="password" 
                            className="w-full p-3 border border-orange-200 rounded-lg bg-white placeholder-gray-400"
                            placeholder="Enter new password (leave blank to keep current)"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Role</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center font-medium ${formData.role === 'manager' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200'}`}>
                                <input type="radio" name="role" value="manager" className="hidden" 
                                    checked={formData.role === 'manager'} 
                                    onChange={() => setFormData({...formData, role: 'manager'})} />
                                Manager
                            </label>
                            <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center font-medium ${formData.role === 'admin' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200'}`}>
                                <input type="radio" name="role" value="admin" className="hidden" 
                                    checked={formData.role === 'admin'} 
                                    onChange={() => setFormData({...formData, role: 'admin'})} />
                                Super Admin
                            </label>
                        </div>
                    </div>

                    {/* Permissions (Only for Manager) */}
                    {formData.role === 'manager' && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <MdSecurity /> Access Permissions
                            </h4>
                            <div className="space-y-2">
                                {permissionOptions.map((perm) => (
                                    <label key={perm.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer select-none">
                                        <div onClick={() => togglePermission(perm.id)} className={`text-2xl ${formData.permissions.includes(perm.id) ? 'text-[#064E3B]' : 'text-gray-300'}`}>
                                            {formData.permissions.includes(perm.id) ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                                        </div>
                                        <span className="text-sm text-gray-700">{perm.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-[#064E3B] text-white py-3 rounded-xl font-bold hover:bg-[#053d2e] flex items-center justify-center gap-2 shadow-lg">
                        <MdSave size={20} /> Update Staff Member
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default EditStaff;