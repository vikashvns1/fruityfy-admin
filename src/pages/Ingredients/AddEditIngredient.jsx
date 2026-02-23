import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../utils/api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdArrowBack, MdSave, MdCloudUpload } from "react-icons/md";

const AddEditIngredient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // File upload ke liye states
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState("");

    const [form, setForm] = useState({
        name: "",
        type: "fruit",
        unit: "ml",
        price: "",
        stock_quantity: "0",
        calories: "0",
        sugar_level: "medium",
        health_tags: "",
        image_url: "", // DB se aane wali image path ke liye
        is_active: 1
    });

    useEffect(() => {
        if (id) {
            setLoading(true);
            api.get(`/juice/ingredients/${id}`)
                .then(res => {
                    if (res.data.success) {
                        setForm(res.data.data);
                        // Agar pehle se image hai toh preview dikhao
                        if (res.data.data.image_url) {
                            setPreview(`http://localhost:5000${res.data.data.image_url}`);
                        }
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    // Image change handler
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file)); // Browser preview
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Form data banana kyunki file bhejni hai
            const formData = new FormData();

            // Saare fields add karna
            Object.keys(form).forEach(key => {
                formData.append(key, form[key]);
            });

            // Agar nayi file select ki hai toh wo bhi add karo
            if (selectedFile) {
                formData.append('image', selectedFile);
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (id)
                await api.put(`/juice/ingredients/${id}`, formData, config);
            else
                await api.post("/juice/ingredients", formData, config);

            toast.success(id ? "Ingredient Updated" : "Ingredient Added");
            navigate("/ingredients");
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading && id) return <Layout><div className="p-10 text-center">Loading Data...</div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/ingredients")}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all shadow-sm"
                    >
                        <MdArrowBack size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-[#064E3B]">
                            {id ? "Edit Ingredient" : "Add New Ingredient"}
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Configure juice components and stock levels</p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">

                    {/* Section 1: Basic Config */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Basic Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Ingredient Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Fresh Orange Juice"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Ingredient Type</label>
                                <select
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white"
                                >
                                    <option value="fruit">Fruit</option>
                                    <option value="vegetable">Vegetable</option>
                                    <option value="liquid">Liquid (Bases)</option>
                                    <option value="booster">Booster (Add-ons)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Pricing & Inventory */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Pricing & Inventory</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Price (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Measurement Unit</label>
                                <select
                                    value={form.unit}
                                    onChange={e => setForm({ ...form, unit: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white"
                                >
                                    <option value="ml">Milliliters (ml)</option>
                                    <option value="gram">Grams (g)</option>
                                    <option value="unit">Per Unit (pcs)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-orange-600 mb-2">Available Stock</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={form.stock_quantity}
                                    onChange={e => setForm({ ...form, stock_quantity: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-orange-200 bg-orange-50 rounded-lg focus:border-orange-500 outline-none font-bold text-orange-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Nutritional & UI */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-50 pb-2">Nutritional & Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Calories (per unit)</label>
                                <input
                                    type="number"
                                    value={form.calories}
                                    onChange={e => setForm({ ...form, calories: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Natural Sugar Level</label>
                                <select
                                    value={form.sugar_level}
                                    onChange={e => setForm({ ...form, sugar_level: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none bg-white"
                                >
                                    <option value="none">None / Zero</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Health Tags (Comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="Immunity, High Fiber, Detox..."
                                    value={form.health_tags}
                                    onChange={e => setForm({ ...form, health_tags: e.target.value })}
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-[#064E3B] outline-none"
                                />
                            </div>

                            {/* IMAGE UPLOAD PART - REPLACED INPUT WITH FILE PICKER */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-[#064E3B] mb-2">Ingredient Image</label>
                                <div className="flex gap-4 items-center">
                                    <div className="relative flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="ingredient-image"
                                        />
                                        <label
                                            htmlFor="ingredient-image"
                                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#064E3B] transition-all text-gray-500"
                                        >
                                            <MdCloudUpload size={20} />
                                            {selectedFile ? selectedFile.name : "Choose Ingredient Image"}
                                        </label>
                                    </div>

                                    {/* Image Preview Box */}
                                    <div className="w-16 h-16 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {preview ? (
                                            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <MdCloudUpload className="text-gray-300" size={24} />
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 accent-[#064E3B]"
                                checked={form.is_active === 1}
                                onChange={e => setForm({ ...form, is_active: e.target.checked ? 1 : 0 })}
                            />
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Visible in Juice Builder</span>
                        </label>

                        <button
                            disabled={loading}
                            type="submit"
                            className="bg-[#064E3B] text-[#FEFCE8] px-10 py-3 rounded-xl text-sm font-bold hover:bg-[#053d2e] shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <MdSave size={18} />
                            {loading ? "Processing..." : id ? "Update Ingredient" : "Create Ingredient"}
                        </button>
                    </div>

                </form>
            </div>
        </Layout>
    );
};

export default AddEditIngredient;