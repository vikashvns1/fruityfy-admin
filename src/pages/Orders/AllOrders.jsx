import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { 
    MdSearch, MdVisibility, MdLocalShipping, MdCheckCircle, 
    MdCancel, MdAccessTime, MdRefresh, MdFilterList, MdDateRange 
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const AllOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [displayedOrders, setDisplayedOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Filter States ---
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(''); // Format: YYYY-MM-DD

    // 1. Fetch Orders from API
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders');
            if (res.data.success && Array.isArray(res.data.data)) {
                setOrders(res.data.data);
                setDisplayedOrders(res.data.data); // Initially show all
            }
        } catch (error) {
            console.error("Failed to fetch orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // 2. Combined Filtering Logic (Search + Status + Date)
    useEffect(() => {
        let result = orders;

        // A. Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(order => 
                order.id.toString().includes(lowerTerm) ||
                (order.customer_name && order.customer_name.toLowerCase().includes(lowerTerm))
            );
        }

        // B. Status Filter
        if (statusFilter) {
            result = result.filter(order => order.order_status === statusFilter);
        }

        // C. Date Filter (Matches exact date of creation)
        if (dateFilter) {
            result = result.filter(order => {
                const orderDate = new Date(order.created_at).toISOString().split('T')[0];
                return orderDate === dateFilter;
            });
        }

        setDisplayedOrders(result);
    }, [searchTerm, statusFilter, dateFilter, orders]);

    // Helpers
    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed': return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'out_for_delivery': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'partially_delivered': return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'pending': return <MdAccessTime />;
            case 'out_for_delivery': return <MdLocalShipping />;
            case 'delivered': return <MdCheckCircle />;
            case 'cancelled': return <MdCancel />;
            default: return <MdCheckCircle className="opacity-50" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-AE', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Reset Filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setDateFilter('');
    };

    return (
        <Layout>
            {/* --- Header Section --- */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Orders</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Manage customer orders and shipments</p>
                    </div>
                    <button 
                        onClick={fetchOrders}
                        className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-[#064E3B] hover:bg-[#FEFCE8] transition-colors shadow-sm"
                        title="Refresh List"
                    >
                        <MdRefresh size={22} />
                    </button>
                </div>

                {/* --- Filters Toolbar --- */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    
                    {/* Left Side: Search */}
                    <div className="relative group w-full md:w-64">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B]" />
                        <input 
                            type="text" 
                            placeholder="Search Order # or Name..." 
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Right Side: Filters */}
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        
                        {/* Status Filter */}
                        <div className="relative">
                            <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <select 
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white outline-none focus:border-[#064E3B] appearance-none cursor-pointer w-full md:w-48"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="partially_delivered">Partially Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                                <MdDateRange />
                            </div>
                            <input 
                                type="date" 
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white outline-none focus:border-[#064E3B] w-full md:w-auto"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                            />
                        </div>

                        {/* Clear Filters Button (Show only if active) */}
                        {(searchTerm || statusFilter || dateFilter) && (
                            <button 
                                onClick={clearFilters}
                                className="text-xs font-bold text-red-500 hover:text-red-700 underline px-2"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Orders Table --- */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Total</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading orders...</td></tr>
                        ) : displayedOrders.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No orders found matching filters.</td></tr>
                        ) : (
                            displayedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#FEFCE8]/30 transition-colors group">
                                    <td className="p-4 font-mono font-semibold text-[#064E3B]">#{order.id}</td>
                                    
                                    <td className="p-4 font-medium">
                                        <div className="flex flex-col">
                                            <span>{order.customer_name || 'Guest User'}</span>
                                            {order.customer_email && (
                                                <span className="text-xs text-gray-400 font-normal">{order.customer_email}</span>
                                            )}
                                        </div>
                                    </td>
                                    
                                    <td className="p-4 text-gray-500 text-xs">
                                        {formatDate(order.created_at)}
                                    </td>
                                    
                                    <td className="p-4 font-bold text-[#064E3B]">
                                        AED {order.final_total}
                                    </td>
                                    
                                    <td className="p-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide border ${getStatusColor(order.order_status)}`}>
                                            {getStatusIcon(order.order_status)}
                                            {order.order_status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => navigate(`/orders/${order.id}`)} 
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                            title="View Details"
                                        >
                                            <MdVisibility size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Footer / Count */}
            {!loading && (
                <div className="p-4 text-xs text-gray-400 text-center">
                    Showing {displayedOrders.length} of {orders.length} orders
                </div>
            )}
        </Layout>
    );
};

export default AllOrders;