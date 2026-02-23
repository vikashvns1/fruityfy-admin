import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MdAdd, MdEdit, MdDelete, MdSearch,
  MdCheckCircle, MdCancel, MdInventory2, MdLocalFireDepartment
} from "react-icons/md";

const IngredientsList = () => {
  const [items, setItems] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get("/juice/ingredients");
      if (res.data.success) setItems(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let filtered = items;
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      filtered = filtered.filter(i =>
        (i.name || "").toLowerCase().includes(t) ||
        (i.type || "").toLowerCase().includes(t) ||
        (i.health_tags || "").toLowerCase().includes(t) // Tags se bhi search hoga
      );
    }
    setDisplayed(filtered);
  }, [items, searchTerm]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will remove the ingredient from all custom juices.")) return;

    try {
      const res = await api.delete(`/juice/ingredients/${id}`);
      if (res.data.success) {
        toast.success("Ingredient deleted");
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      fruit: "bg-orange-100 text-orange-700",
      liquid: "bg-blue-100 text-blue-700",
      vegetable: "bg-green-100 text-green-700",
      booster: "bg-purple-100 text-purple-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Juice Builder</h1>
            <p className="text-xs text-gray-500 mt-1">Manage fruits, liquids & boosters for customization</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, type or tags..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#064E3B] outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Link
              to="/ingredients/add"
              className="bg-[#064E3B] text-[#FEFCE8] px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg hover:bg-[#053d2e] transition-all"
            >
              <MdAdd size={20} /> Add New
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Ingredient</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nutritional Info</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Price/Unit</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Stock</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="7" className="p-12 text-center text-gray-400">Fetching inventory...</td></tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <MdInventory2 size={40} />
                      <p>No ingredients found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayed.map(item => (
                  <tr key={item.id} className="hover:bg-[#FEFCE8]/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                          {item.image_url ? (
                            <img src={`http://localhost:5000${item.image_url}`} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs uppercase">
                              {item.name.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="max-w-[180px]">
                          <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                          {/* Health Tags Section */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.health_tags ? item.health_tags.split(',').map((tag, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded-md border border-gray-200 truncate">
                                {tag.trim()}
                              </span>
                            )) : <span className="text-[10px] text-gray-300 italic">No tags</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeBadge(item.type)}`}>
                        {item.type}
                      </span>
                    </td>

                    {/* Calorie & Sugar Column */}
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-xs text-gray-700">
                          <MdLocalFireDepartment className="text-orange-500" />
                          <span className="font-medium">{item.calories || 0} cal</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase ${item.sugar_level === 'high' ? 'text-red-500' : 'text-green-600'}`}>
                          Sugar: {item.sugar_level}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-sm">
                        <span className="font-bold text-gray-900">₹{item.price}</span>
                        <span className="text-gray-400 text-xs"> / {item.unit}</span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className={`inline-flex flex-col items-center px-3 py-1 rounded-lg border ${item.stock_quantity <= 10 ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                        <span className={`text-sm font-bold ${item.stock_quantity <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
                          {item.stock_quantity}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase font-medium">{item.unit}</span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {item.is_active ? (
                        <MdCheckCircle className="text-green-500 inline shadow-sm" size={20} title="Active" />
                      ) : (
                        <MdCancel className="text-gray-200 inline" size={20} title="Inactive" />
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-120 transition-opacity">
                        <Link 
                          to={`/ingredients/edit/${item.id}`} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <MdEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>
    </Layout>
  );
};

export default IngredientsList;