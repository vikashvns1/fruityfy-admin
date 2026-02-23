import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { MdAdd, MdEdit, MdDelete, MdSearch, MdArrowBack, MdFolderOpen, MdChevronRight, MdFilterList } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AllCategories = () => {
    const navigate = useNavigate();
    const [allCategories, setAllCategories] = useState([]); // Stores EVERYTHING
    const [displayedCategories, setDisplayedCategories] = useState([]); // Stores what user sees NOW
    const [loading, setLoading] = useState(true);
    
    // --- FILTERS ---
    const [searchTerm, setSearchTerm] = useState('');
    
    // ✅ YAHAN HAI AAPKA FILTER STATE
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

    // Navigation History (To handle "Back" button logic)
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Main Categories' }]);
    const currentParentId = breadcrumbs[breadcrumbs.length - 1].id;

    // 1. Fetch Data
    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            if (res.data.success && Array.isArray(res.data.data)) {
                setAllCategories(res.data.data);
            } else {
                setAllCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // 2. Update View when "Current Parent", "Search", or "Status" changes
    useEffect(() => {
        if (!allCategories.length) return;

        let filtered = allCategories;

        // A. Search & Hierarchy Logic
        if (!searchTerm) {
            // Agar search nahi kar rahe, to sirf current folder ke items dikhao
            filtered = filtered.filter(cat => cat.parent_id === currentParentId);
        } else {
            // Agar search kar rahe hain, to poore database me dhoondo (Hierarchy ignore karo)
            filtered = filtered.filter(cat =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // B. ✅ STATUS FILTER LOGIC
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active' ? 1 : 0;
            filtered = filtered.filter(cat => cat.is_active === isActive);
        }

        setDisplayedCategories(filtered);
    }, [allCategories, currentParentId, searchTerm, statusFilter]);

    // 3. Smart Navigation Logic (The "Drill Down")
    const handleCategoryClick = (category) => {
        const hasChildren = allCategories.some(cat => cat.parent_id === category.id);

        if (hasChildren) {
            setBreadcrumbs([...breadcrumbs, { id: category.id, name: category.name }]);
            setSearchTerm(''); // Clear search
            setStatusFilter('all'); // Reset filter on drill down
        } else {
            navigate(`/products?category=${category.id}`);
        }
    };

    const handleBack = () => {
        if (breadcrumbs.length > 1) {
            const newBreadcrumbs = [...breadcrumbs];
            newBreadcrumbs.pop();
            setBreadcrumbs(newBreadcrumbs);
            setSearchTerm('');
            setStatusFilter('all');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure? This will delete the category.")) {
            try {
                const res = await api.delete(`/categories/${id}`);
                if (res.data.success) {
                    toast.success("Category deleted");
                    fetchCategories();
                }
            } catch (error) {
                // Error handled by interceptor
            }
        }
    };

    return (
        <Layout>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    {breadcrumbs.length > 1 && (
                        <button onClick={handleBack} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                            <MdArrowBack size={20} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-[#064E3B]">
                            {breadcrumbs[breadcrumbs.length - 1].name}
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {searchTerm || statusFilter !== 'all' ? 'Filtered Results' : `Managing ${displayedCategories.length} items`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    
                    {/* ✅ STATUS FILTER DROPDOWN */}
                    <div className="relative group w-full md:w-40">
                        <MdFilterList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#064E3B] bg-white cursor-pointer appearance-none"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Hidden Only</option>
                        </select>
                    </div>

                    {/* Search Bar */}
                    <div className="relative group w-full md:w-64">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#064E3B]" />
                        <input
                            type="text"
                            placeholder="Search category..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#064E3B] focus:ring-1 focus:ring-[#064E3B] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Link
                        to="/categories/add"
                        className="bg-[#064E3B] text-[#FEFCE8] px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#053d2e] transition-colors shadow-sm whitespace-nowrap"
                    >
                        <MdAdd size={18} /> Add New
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                        <tr>
                            <th className="p-4 w-16">Img</th>
                            <th className="p-4">Category Name</th>
                            <th className="p-4 hidden md:table-cell">Slug</th>
                            <th className="p-4 text-center">Type</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading data...</td></tr>
                        ) : displayedCategories.length === 0 ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">No categories found matching your filters.</td></tr>
                        ) : (
                            displayedCategories.map((cat) => {
                                const hasChildren = allCategories.some(c => c.parent_id === cat.id);

                                return (
                                    <tr
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat)}
                                        className="hover:bg-[#FEFCE8]/30 cursor-pointer transition-colors group border-b border-gray-50"
                                    >
                                        <td className="p-3">
                                            <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                                {cat.image_url ? (
                                                    <img src={`http://localhost:5000${cat.image_url}`} alt={cat.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                        <MdFolderOpen size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 font-medium text-[#064E3B] flex items-center gap-2">
                                            {cat.name}
                                            {cat.is_new === 1 && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">
                                                    NEW
                                                </span>
                                            )}
                                            {hasChildren && <MdChevronRight className="text-gray-300 group-hover:text-[#064E3B] transition-colors" />}
                                        </td>
                                        <td className="p-3 text-gray-500 hidden md:table-cell font-mono text-xs">{cat.slug}</td>
                                        <td className="p-3 text-center">
                                            {hasChildren ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                    Folder
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                    Leaf
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${cat.is_active
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                                {cat.is_active ? 'Active' : 'Hidden'}
                                            </span>
                                        </td>

                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/categories/edit/${cat.id}`) }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Edit"
                                                >
                                                    <MdEdit size={18} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(e, cat.id)}
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

export default AllCategories;