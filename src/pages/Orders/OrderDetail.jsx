import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    MdArrowBack, MdLocalShipping, MdPerson, MdLocationOn,
    MdPayment, MdReceipt, MdCheckCircle, MdSave,
    MdCheckBox, MdCheckBoxOutlineBlank, MdTimeline, MdWarning
} from 'react-icons/md';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- State for Global Order Update ---
    const [newStatus, setNewStatus] = useState('');
    const [updateComment, setUpdateComment] = useState('');
    const [updating, setUpdating] = useState(false);

    // --- State for Item Level Update ---
    const [selectedItems, setSelectedItems] = useState([]);
    const [itemStatus, setItemStatus] = useState('');
    const [updatingItems, setUpdatingItems] = useState(false);

    // 1. Fetch Order Data
    const fetchOrderDetails = async () => {
        try {
            const res = await api.get(`/orders/${id}`);
            if (res.data.success) {
                setOrder(res.data.data);
                setNewStatus(res.data.data.order_status);
                setSelectedItems([]);
            }
        } catch (error) {
            toast.error("Failed to load order details");
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    // 2. Handle Global Status Update (Master Order)
    const handleUpdateStatus = async () => {
        setUpdating(true);
        try {
            const res = await api.put(`/orders/${id}/status`, {
                order_status: newStatus,
                comment: updateComment
            });
            if (res.data.success) {
                toast.success("Main Order status updated successfully!");
                fetchOrderDetails();
                setUpdateComment('');
            }
        } catch (error) {
            // Handled by interceptor
        } finally {
            setUpdating(false);
        }
    };

    // 3. Item Selection Logic
    const toggleItemSelection = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const toggleAllItems = () => {
        if (selectedItems.length === order.items.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(order.items.map(item => item.id));
        }
    };

    // 4. Handle Item Specific Status Update
    const handleUpdateItemStatus = async () => {
        if (selectedItems.length === 0) {
            toast.warning("Please select items to update.");
            return;
        }
        if (!itemStatus) {
            toast.warning("Please select a status.");
            return;
        }

        setUpdatingItems(true);
        try {
            const res = await api.put(`/orders/${id}/items/status`, {
                itemIds: selectedItems,
                status: itemStatus
            });

            if (res.data.success) {
                toast.success(`Updated ${selectedItems.length} items to ${itemStatus}`);
                fetchOrderDetails();
                setItemStatus('');
            }
        } catch (error) {
            toast.error("Failed to update items");
        } finally {
            setUpdatingItems(false);
        }
    };

    // --- HELPER: Item Status Badge Color (Based on order_items table enum) ---
    const getItemStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'preparing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'confirmed': return 'bg-teal-100 text-teal-700 border-teal-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            case 'returned':
            case 'return_requested': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'exchange_requested':
            case 'exchanged': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    if (loading) return <Layout><div className="p-10 text-center">Loading Order...</div></Layout>;
    if (!order) return <Layout><div className="p-10 text-center">Order not found</div></Layout>;

    return (
        <Layout>
            {/* --- Header Section --- */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/orders')} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm">
                    <MdArrowBack size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Order #{order.id}</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>
                <div className="ml-auto">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${order.order_status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                            order.order_status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                order.order_status === 'partially_delivered' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-yellow-50 text-yellow-800 border-yellow-200'
                        }`}>
                        {order.order_status.replace(/_/g, " ")}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- LEFT COLUMN (Items & Updates) --- */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. ORDER ITEMS CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                        {/* Card Header */}
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <MdReceipt className="text-[#064E3B]" />
                                <h3 className="font-bold text-gray-800">Order Items</h3>
                            </div>
                            <button
                                onClick={toggleAllItems}
                                className="text-xs font-bold text-[#064E3B] hover:underline"
                            >
                                {selectedItems.length === order.items.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>

                        {/* Items Table */}
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                                <tr>
                                    <th className="p-4 w-10 text-center">#</th>
                                    <th className="p-4">Product</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-center">Qty</th>
                                    <th className="p-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                                {order.items.map((item) => (
                                    <tr key={item.id} className={`transition-colors ${selectedItems.includes(item.id) ? 'bg-[#FEFCE8]' : 'hover:bg-gray-50'}`}>

                                        {/* Checkbox */}
                                        <td className="p-4 text-center">
                                            <button onClick={() => toggleItemSelection(item.id)} className="text-xl text-[#064E3B]">
                                                {selectedItems.includes(item.id) ? <MdCheckBox /> : <MdCheckBoxOutlineBlank className="text-gray-300" />}
                                            </button>
                                        </td>

                                        {/* Product Info */}
                                        <td className="p-4">
                                            <div className="flex items-start gap-4">
                                                {/* Generic Image Logic for ID 81 */}
                                                <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                    <img
                                                        src={
                                                            `http://localhost:5000${item.product_image}`}
                                                        alt=""
                                                        className="max-h-full object-contain mix-blend-multiply"
                                                    />
                                                </div>

                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        {item.product_name}
                                                        {item.product_id === 81 && (
                                                            <span className="bg-[#064E3B] text-[#FACC15] text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                                                                LAB MIX
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium">AED {item.price}</div>

                                                    {/* ⭐ KITCHEN MIXING SLIP: Recipe display logic */}
                                                    {item.product_id === 81 && item.customization && (
                                                        <div className="mt-3 p-4 bg-[#FACC15]/5 border border-[#FACC15]/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                            <div className="flex items-center gap-2 mb-2 border-b border-[#FACC15]/10 pb-1">
                                                                <MdTimeline className="text-[#064E3B]" size={14} />
                                                                <span className="text-[10px] font-black text-[#064E3B] uppercase tracking-widest">Molecular Recipe Slip</span>
                                                            </div>

                                                            {(() => {
                                                                try {
                                                                    const config = typeof item.customization === 'string'
                                                                        ? JSON.parse(item.customization)
                                                                        : item.customization;

                                                                    return (
                                                                        <>
                                                                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2">
                                                                                {config.ingredients.map((ing, idx) => (
                                                                                    <div key={idx} className="flex justify-between items-center text-[11px] border-b border-dashed border-gray-100 pb-1">
                                                                                        <span className="text-gray-500 font-medium">• {ing.name}</span>
                                                                                        <span className="font-bold text-[#064E3B]">{ing.qty}{ing.unit}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                            {config.nutrition && (
                                                                                <div className="mt-3 text-[9px] font-bold text-gray-400 uppercase flex justify-between">
                                                                                    <span>Est. Energy Yield</span>
                                                                                    <span className="text-[#064E3B]">{config.nutrition.calories} kcal</span>
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    );
                                                                } catch (err) {
                                                                    return <div className="text-[10px] text-red-400 italic flex items-center gap-1"><MdWarning /> Recipe Data Corrupted</div>;
                                                                }
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Item Status Badge */}
                                        <td className="p-4 text-center">
                                            <span className={`text-[10px] px-2 py-1 rounded border uppercase font-bold ${getItemStatusColor(item.item_status)}`}>
                                                {item.item_status.replace(/_/g, " ")}
                                            </span>
                                        </td>

                                        <td className="p-4 text-center">{item.quantity}</td>
                                        <td className="p-4 text-right font-bold">AED {item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* --- ITEM STATUS UPDATE TOOLBAR (Updated with Correct Enum) --- */}
                        <div className="p-4 bg-blue-50 border-t border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-blue-800 text-sm">
                                <MdCheckCircle />
                                <span className="font-semibold">{selectedItems.length} items selected</span>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <select
                                    className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-200 outline-none w-full md:w-48"
                                    value={itemStatus}
                                    onChange={(e) => setItemStatus(e.target.value)}
                                >
                                    <option value="">Update Selected To...</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="returned">Returned</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>

                                <button
                                    onClick={handleUpdateItemStatus}
                                    disabled={updatingItems || selectedItems.length === 0}
                                    className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm"
                                >
                                    {updatingItems ? 'Updating...' : 'Apply'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 2. GLOBAL ORDER UPDATE (Updated with Correct Enum) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MdLocalShipping className="text-[#064E3B]" /> Update Main Order
                        </h3>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="w-full md:w-1/3">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
                                <select
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#064E3B]"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="partially_delivered">Partially Delivered</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="partially_returned">Partially Returned</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="w-full md:w-1/2">
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Comment</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#064E3B]"
                                    placeholder="e.g. Order verified"
                                    value={updateComment}
                                    onChange={(e) => setUpdateComment(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleUpdateStatus}
                                disabled={updating}
                                className="bg-[#064E3B] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#053d2e] transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <MdSave /> Update
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN (Information) --- */}
                <div className="space-y-6">

                    {/* Customer Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <MdPerson className="text-gray-400" /> Customer
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Name:</span>
                                <span className="font-bold text-gray-900">{order.full_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email:</span>
                                <span className="font-bold text-gray-900 break-all">{order.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone:</span>
                                <span className="font-bold text-gray-900">{order.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <MdLocationOn className="text-gray-400" /> Address
                        </h3>
                        <div className="text-sm text-gray-700">
                            {order.address_line_1 ? (
                                <>
                                    <p className="font-medium">{order.address_line_1}</p>
                                    <p>{order.area}, {order.city}</p>
                                    {order.delivery_slot && <p className="mt-2 text-xs text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded">{order.delivery_slot}</p>}
                                </>
                            ) : <p className="italic text-gray-400">No Address (Store Pickup?)</p>}
                        </div>
                    </div>

                    {/* Timeline Sidebar (Global) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <MdTimeline className="text-gray-400" /> Timeline
                        </h3>
                        <div className="space-y-6 relative border-l-2 border-gray-100 ml-2">
                            {order.tracking && order.tracking.map((track, index) => (
                                <div key={index} className="ml-6 relative">
                                    <span className={`absolute -left-[31px] top-0 h-4 w-4 rounded-full ring-4 ring-white ${track.order_item_id ? 'bg-blue-500' : 'bg-[#064E3B]'
                                        }`}></span>

                                    <p className="text-sm font-bold text-gray-900 capitalize">
                                        {track.status.replace(/_/g, ' ')}
                                        {track.order_item_id && <span className="ml-2 text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">ITEM</span>}
                                    </p>

                                    <p className="text-xs text-gray-500">{new Date(track.created_at).toLocaleString()}</p>

                                    {track.comment && (
                                        <p className="text-xs text-gray-600 mt-1 italic bg-gray-50 p-1 rounded">"{track.comment}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
};

export default OrderDetail;