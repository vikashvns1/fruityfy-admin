import { useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// FIXED: Added MdSecurity to the import list below
import { MdArrowBack, MdSave, MdCheckBox, MdCheckBoxOutlineBlank, MdSecurity } from 'react-icons/md';

const AddStaff = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        role: 'manager', // Default to manager
        permissions: [] 
    });

    const permissionOptions = [
        { id: 'dashboard', label: 'View Dashboard' },
        { id: 'orders', label: 'Manage Orders' },
        { id: 'products', label: 'Manage Products' },
        { id: 'customers', label: 'Manage Customers' },
        { id: 'staff', label: 'Manage Staff' }
    ];

    const togglePermission = (id) => {
        setFormData(prev => {
            const current = prev.permissions;
            if (current.includes(id)) {
                return { ...prev, permissions: current.filter(p => p !== id) };
            } else {
                return { ...prev, permissions: [...current, id] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/staff', formData);
            if (res.data.success) {
                toast.success("Staff member created!");
                navigate('/staff');
            }
        } catch (error) {
            // Error handled by interceptor
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate('/staff')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <MdArrowBack size={20} />
                    </button>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Add New Staff</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <input 
                                type="text" required
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <input 
                                type="email" required
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                            <input 
                                type="text"
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                            <input 
                                type="password" required
                                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#064E3B]"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Role</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center font-medium transition-colors ${formData.role === 'manager' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="role" value="manager" className="hidden" 
                                    checked={formData.role === 'manager'} 
                                    onChange={() => setFormData({...formData, role: 'manager'})} 
                                />
                                Manager
                            </label>
                            <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center font-medium transition-colors ${formData.role === 'admin' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input type="radio" name="role" value="admin" className="hidden" 
                                    checked={formData.role === 'admin'} 
                                    onChange={() => setFormData({...formData, role: 'admin'})} 
                                />
                                Super Admin
                            </label>
                        </div>
                    </div>

                    {/* Permissions Section - Only show if role is Manager */}
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
                        <MdSave size={20} /> Create Account
                    </button>

                </form>
            </div>
        </Layout>
    );
};

export default AddStaff;