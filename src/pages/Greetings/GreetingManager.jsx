import { useEffect, useState } from 'react';
import api from '../../utils/api'; 
import { toast } from 'react-toastify'; 
import Layout from '../../components/Layout'; 
import { MdDelete, MdAddCircle, MdPowerSettingsNew, MdMessage, MdLabel, MdEdit, MdFilterList } from 'react-icons/md'; 

const GreetingManager = () => {
    const [greetings, setGreetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // ⭐ Edit State
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({ category: 'General', message_text: '' });
    const [filterCategory, setFilterCategory] = useState('All');

    const categories = ['General', 'Festival', 'Birthday', 'Anniversary', 'Health', 'Thank You'];

    useEffect(() => {
        fetchGreetings();
    }, []);

    const fetchGreetings = async () => {
        try {
            // Admin=true bhej rahe hain taaki inactive messages bhi dikhein
            const res = await api.get('/greetings?admin=true'); 
            if (res.data.success) setGreetings(res.data.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (g) => {
        setEditId(g.id);
        setFormData({ category: g.category, message_text: g.message_text });
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Form par le jao
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.message_text) return toast.error("Message cannot be empty");
        
        setIsSubmitting(true);
        try {
            if (editId) {
                // UPDATE LOGIC
                await api.put(`/greetings/${editId}`, formData);
                toast.success("Message Updated! ✨");
            } else {
                // CREATE LOGIC
                await api.post('/greetings/add', formData);
                toast.success("Message Added! 🎉");
            }
            setFormData({ category: 'General', message_text: '' });
            setEditId(null);
            fetchGreetings();
        } catch (err) {
            toast.error("Process failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await api.put(`/greetings/${id}/status`, { is_active: newStatus });
            toast.success("Status Updated");
            fetchGreetings();
        } catch (err) { toast.error("Update failed"); }
    };

    const deleteGreeting = async (id) => {
        if (!window.confirm("Bhai, delete kar dein?")) return;
        try {
            await api.delete(`/greetings/${id}`);
            toast.success("Deleted!");
            fetchGreetings();
        } catch (err) { toast.error("Delete failed"); }
    };

    const displayedGreetings = filterCategory === 'All' 
        ? greetings 
        : greetings.filter(g => g.category.includes(filterCategory));

    return (
        <Layout>
            <div className="p-6 space-y-8 bg-gray-50 min-h-screen font-sans">
                {/* HEADER & FILTER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-[#064e3b] flex items-center gap-2">
                            <MdMessage size={28} /> Greeting Manager
                        </h1>
                        <p className="text-gray-500 text-sm">Manage {greetings.length} predefined messages.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                        <MdFilterList className="text-gray-400" size={20} />
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-transparent text-sm font-bold text-gray-700 outline-none pr-4">
                            <option value="All">All Categories</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FORM SECTION */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-[#064e3b]">
                            {editId ? <MdEdit size={20} className="text-orange-500"/> : <MdAddCircle size={20} className="text-green-600"/>}
                            {editId ? "Edit Message" : "Create New Message"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-green-500">
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Message Text</label>
                                <textarea rows="4" value={formData.message_text} onChange={(e) => setFormData({...formData, message_text: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm" />
                            </div>
                            <div className="flex gap-2">
                                <button disabled={isSubmitting} className={`flex-1 ${editId ? 'bg-orange-500' : 'bg-[#064e3b]'} text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2`}>
                                    {isSubmitting ? "Processing..." : (editId ? "Update Message" : "Save Greeting")}
                                </button>
                                {editId && (
                                    <button type="button" onClick={() => {setEditId(null); setFormData({category:'General', message_text:''})}} className="bg-gray-200 text-gray-600 px-4 rounded-xl font-bold">Cancel</button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* LIST SECTION */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Occasion</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Message</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-center">Status</th>
                                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {displayedGreetings.map((g) => (
                                    <tr key={g.id} className={`hover:bg-gray-50/50 transition-all ${!g.is_active && 'bg-gray-50/80 opacity-60'}`}>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 w-fit ${g.is_active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-200 text-gray-500 border-gray-300'}`}>
                                                <MdLabel size={12} /> {g.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 italic">"{g.message_text}"</td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => toggleStatus(g.id, g.is_active)} className={`p-2 rounded-lg transition ${g.is_active ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                                                <MdPowerSettingsNew size={20} />
                                            </button>
                                        </td>
                                        <td className="p-4 text-right space-x-1">
                                            <button onClick={() => handleEditClick(g)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><MdEdit size={20}/></button>
                                            <button onClick={() => deleteGreeting(g.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><MdDelete size={20}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default GreetingManager;