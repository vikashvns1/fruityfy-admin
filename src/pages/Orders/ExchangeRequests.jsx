import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { MdRefresh, MdCheck, MdClose, MdLoop, MdDoneAll } from 'react-icons/md';

const ExchangeRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders/admin/exchanges');
            if (res.data.success) {
                setRequests(res.data.data);
            }
        } catch (error) {
            toast.error("Failed to fetch requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdate = async (id, status) => {
        if(!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;

        try {
            const res = await api.put(`/orders/admin/exchange/${id}`, { status });
            if (res.data.success) {
                toast.success(`Request ${status}`);
                fetchRequests();
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    // Badge Helper
    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${styles[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Exchange & Return Requests</h1>
                    <p className="text-xs text-gray-500">Manage customer refund and replacement requests</p>
                </div>
                <button onClick={fetchRequests} className="p-2 bg-white border rounded hover:bg-gray-50">
                    <MdRefresh size={22} />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Product</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm">
                        {loading ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-400">Loading...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-gray-400">No pending requests.</td></tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{req.full_name}</div>
                                        <div className="text-xs text-gray-500">{req.phone}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-[#064E3B]">{req.product_name}</div>
                                        <div className="text-xs text-gray-500">Qty: {req.qty}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                            req.request_type === 'return' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                            {req.request_type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                    <td className="p-4">{getStatusBadge(req.request_status)}</td>
                                    <td className="p-4 text-right">
                                        {req.request_status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleUpdate(req.id, 'approved')}
                                                    className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" title="Approve"
                                                >
                                                    <MdCheck size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleUpdate(req.id, 'rejected')}
                                                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Reject"
                                                >
                                                    <MdClose size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {req.request_status === 'approved' && (
                                            <button 
                                                onClick={() => handleUpdate(req.id, 'completed')}
                                                className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded hover:bg-green-200 flex items-center gap-1 ml-auto"
                                            >
                                                <MdDoneAll size={14} /> Mark Completed
                                            </button>
                                        )}
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

export default ExchangeRequests;