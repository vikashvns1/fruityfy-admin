import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { MdSearch, MdEmail, MdPhone, MdEdit } from 'react-icons/md'; // Removed MdPerson if unused
import { useNavigate } from 'react-router-dom'; // <--- IMPORT THIS

const AllCustomers = () => {
    const navigate = useNavigate(); // <--- DEFINE THIS
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('/customers');
                if (res.data.success) {
                    setCustomers(res.data.data);
                }
            } catch (error) {
                console.error("Failed to load customers");
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    // Filter Logic
    const filteredCustomers = customers.filter(c =>
        c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Customers</h1>
                    <p className="text-xs text-gray-500 mt-0.5">View your registered users</p>
                </div>
                <div className="relative group w-full md:w-64">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B]" />
                    <input
                        type="text"
                        placeholder="Search name or email..."
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <tr>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4 text-center">Orders</th>
                            <th className="p-4 text-right">Total Spent</th>
                            <th className="p-4 text-center">Joined</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : filteredCustomers.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No customers found.</td></tr>
                        ) : (
                            filteredCustomers.map((c) => (
                                <tr key={c.id} className="hover:bg-[#FEFCE8]/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center font-bold text-sm">
                                                {c.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="font-medium text-[#064E3B]">{c.full_name}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <div className="flex items-center gap-1"><MdEmail size={14} /> {c.email}</div>
                                            <div className="flex items-center gap-1"><MdPhone size={14} /> {c.phone}</div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center font-medium">
                                        {c.total_orders}
                                    </td>
                                    <td className="p-4 text-right font-bold text-[#064E3B]">
                                        AED {c.total_spent}
                                    </td>
                                    <td className="p-4 text-center text-gray-400 text-xs">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => navigate(`/customers/edit/${c.id}`)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Customer"
                                        >
                                            <MdEdit size={18} />
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

export default AllCustomers;