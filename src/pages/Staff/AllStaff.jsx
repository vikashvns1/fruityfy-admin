import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { MdAdd, MdDelete, MdEdit } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllStaff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff');
            if (res.data.success) setStaff(res.data.data);
        } catch (error) {
            console.error("Failed to load staff");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to remove this staff member?")) return;
        try {
            await api.delete(`/staff/${id}`);
            toast.success("Staff member removed");
            fetchStaff();
        } catch (error) {
            toast.error("Failed to delete staff");
        }
    };

    return (
        <Layout title="Team Management" subtitle="Manage admins and permissions">
            <div className="flex justify-between items-center mb-6">
                <div>
                    {/* Header handled by Layout, adding empty div to maintain spacing if needed */}
                </div>
                <Link to="/staff/add" className="bg-[#064E3B] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#053d2e] transition-colors">
                    <MdAdd size={20} /> Add New Member
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Permissions</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : staff.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-400">No staff members found.</td></tr>
                        ) : (
                            staff.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-medium text-[#064E3B]">{user.full_name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.role === 'admin' ? (
                                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">All Access</span>
                                            ) : user.permissions && user.permissions.length > 0 ? (
                                                user.permissions.map(p => (
                                                    <span key={p} className="text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200 capitalize">{p}</span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No access</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => navigate(`/staff/edit/${user.id}`)} 
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit Details"
                                            >
                                                <MdEdit size={18} />
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove Staff"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
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

export default AllStaff;