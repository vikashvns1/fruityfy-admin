import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api,{API_BASE_URL} from '../../utils/api';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdWarning, MdCheckCircle, MdCancel, MdTrendingUp,MdShoppingBag,MdAutoFixHigh } from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllProducts = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const categoryFilterId = queryParams.get('category');

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            if (res.data.success && Array.isArray(res.data.data)) {
                setAllProducts(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let filtered = allProducts;

        if (categoryFilterId) {
            filtered = filtered.filter(p => p.category_id.toString() === categoryFilterId);
        }

        // 2. Product Type Filter (Architecture)
        if (typeFilter !== 'all') {
            filtered = filtered.filter(p => p.product_type === typeFilter);
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                (p.sku && p.sku.toLowerCase().includes(lowerTerm))
            );
        }

        setDisplayedProducts(filtered);
    }, [allProducts, categoryFilterId, searchTerm, typeFilter]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? This cannot be undone.")) {
            try {
                const res = await api.delete(`/products/${id}`);
                if (res.data.success) {
                    toast.success("Product deleted successfully");
                    fetchProducts();
                }
            } catch (error) {
                // Error handled by api interceptor
            }
        }
    };

    const ETA_BADGE = {
        same_day: {
            label: 'Same Day',
            class: 'bg-green-50 text-green-700 border-green-200'
        },
        next_day: {
            label: 'Next Day',
            class: 'bg-blue-50 text-blue-700 border-blue-200'
        },
        two_to_four_days: {
            label: '2–4 Days',
            class: 'bg-yellow-50 text-yellow-800 border-yellow-200'
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">
                        {categoryFilterId ? 'Filtered Products' : 'Inventory'}
                    </h1>

                    {/* Quick Filters for Architecture Type */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTypeFilter('all')}
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all border ${typeFilter === 'all' ? 'bg-[#064E3B] text-white border-[#064E3B]' : 'bg-white text-gray-500 border-gray-200'}`}
                        >All Items</button>
                        <button
                            onClick={() => setTypeFilter('simple')}
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all border ${typeFilter === 'simple' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200'}`}
                        >Standard</button>
                        <button
                            onClick={() => setTypeFilter('customizable')}
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all border ${typeFilter === 'customizable' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-500 border-gray-200'}`}
                        >Juice Builder</button>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {categoryFilterId && (
                        <button
                            onClick={() => navigate('/products')}
                            className="text-red-600 text-xs font-bold px-3 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1"
                        >
                            <MdCancel /> Clear Filter
                        </button>
                    )}

                    <div className="relative group w-full md:w-64">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B]" />
                        <input
                            type="text"
                            placeholder="Search name or SKU..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#064E3B] transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Link
                        to="/products/add"
                        className="bg-[#064E3B] text-[#FEFCE8] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#053d2e] transition-colors shadow-sm whitespace-nowrap"
                    >
                        <MdAdd size={18} /> Add Product
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <tr>
                            <th className="p-4 w-16">Img</th>
                            <th className="p-4">Product Info</th>
                            <th className="p-4">Product Type</th>
                            <th className="p-4">Economics (P&L)</th>
                            <th className="p-4">Inventory Status</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading products...</td></tr>
                        ) : displayedProducts.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No products found.</td></tr>
                        ) : (
                            displayedProducts.map((product) => {
                                // Logic for Alerts
                                const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 5);
                                const isOutOfStock = product.stock_quantity === 0;

                                // Logic for Price/Profit
                                const sellingPrice = Number(product.discount_price) > 0 ? Number(product.discount_price) : Number(product.price);
                                const costPrice = Number(product.purchase_price) || 0;
                                const profit = sellingPrice - costPrice;

                                return (
                                    <tr key={product.id} className="hover:bg-[#FEFCE8]/30 transition-colors group border-b border-gray-50">

                                        {/* 1. Image */}
                                        <td className="p-3">
                                            <div className="h-12 w-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden shrink-0">
                                                {product.image_url ? (
                                                    <img src={`${API_BASE_URL}${product.image_url}`} alt={product.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No Img</div>
                                                )}
                                            </div>
                                        </td>

                                        {/* 2. Product Info */}
                                        <td className="p-3">
                                            <div className="font-bold text-gray-900">{product.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 rounded">{product.sku || 'NO-SKU'}</span>
                                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 rounded border border-blue-100">
                                                    {product.category_name || 'Uncategorized'}
                                                </span>
                                            </div>
                                            {/* ETA Badge */}
                                            {product.delivery_eta && (
                                                <span
                                                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded border ${ETA_BADGE[product.delivery_eta]?.class || 'bg-gray-50 text-gray-500'
                                                        }`}
                                                >
                                                    🚚 {ETA_BADGE[product.delivery_eta]?.label || 'Delivery'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {product.product_type === 'customizable' ? (
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100 uppercase tracking-tighter">
                                                        <MdAutoFixHigh size={12} /> Customizable
                                                    </span>
                                                    <Link to={`/mapping?productId=${product.id}`} state={{ from: '/products' }} className="text-[9px] text-purple-400 hover:text-purple-700 font-medium underline">Configure Mix →</Link>
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200 uppercase tracking-tighter">
                                                    <MdShoppingBag size={12} /> Simple Product
                                                </span>
                                            )}
                                        </td>
                                        {/* 3. Economics */}
                                        <td className="p-3">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="font-bold text-[#064E3B]">
                                                    ₹{sellingPrice.toFixed(2)}
                                                    {Number(product.discount_price) > 0 && <span className="text-gray-400 line-through text-[10px] ml-1">₹{product.price}</span>}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-500" title="Purchase Price">Buy: ₹{costPrice}</span>
                                                    {profit > 0 ? (
                                                        <span className="text-green-600 flex items-center gap-0.5 bg-green-50 px-1 rounded font-medium">
                                                            <MdTrendingUp size={10} /> +₹{profit.toFixed(0)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-500 bg-red-50 px-1 rounded font-medium">
                                                            Loss: ₹{profit.toFixed(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* 4. Inventory Status */}
                                        <td className="p-3">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800">
                                                    {product.stock_quantity} <span className="text-xs font-normal text-gray-500">{product.unit}</span>
                                                </span>
                                                {isOutOfStock ? (
                                                    <span className="text-[10px] font-bold text-red-600 flex items-center gap-1 mt-0.5">
                                                        <MdCancel size={12} /> OUT OF STOCK
                                                    </span>
                                                ) : isLowStock ? (
                                                    <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1 mt-0.5">
                                                        <MdWarning size={12} /> LOW STOCK
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-green-600 mt-0.5">In Stock</span>
                                                )}
                                            </div>
                                        </td>

                                        {/* 5. Status */}
                                        <td className="p-3 text-center">
                                            {product.is_active ? (
                                                <MdCheckCircle className="text-green-500 inline-block" size={20} title="Active" />
                                            ) : (
                                                <MdCancel className="text-gray-300 inline-block" size={20} title="Hidden" />
                                            )}
                                        </td>

                                        {/* 6. Actions */}
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/products/edit/${product.id}`)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Edit"
                                                >
                                                    <MdEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                    title="Delete"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AllProducts;