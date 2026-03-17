import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api,{API_BASE_URL} from '../../utils/api';
import { toast } from 'react-toastify';
import { MdAdd, MdDelete, MdToggleOn, MdToggleOff, MdLink } from 'react-icons/md';

const Popups = () => {
    const [popups, setPopups] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [image, setImage] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [preview, setPreview] = useState(null);

    const fetchPopups = async () => {
        try {
            const res = await api.get('/popups');
            if (res.data.success) setPopups(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPopups(); }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

   const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return toast.warning("Please select an image");

        const formData = new FormData();
        formData.append('image', image); // Key must be 'image'
        formData.append('link_url', linkUrl);
        formData.append('is_active', 1);

        try {
            // ✅ FIX: Do NOT manually set Content-Type header for FormData in axios/fetch mostly
            // If you are using your 'api' wrapper (axios instance), let it handle the header automatically.
            
            const res = await api.post('/popups', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Explicitly setting it for safety in some setups
                }
            });

            if (res.data.success) {
                toast.success("Popup created!");
                setImage(null);
                setPreview(null);
                setLinkUrl('');
                // Reset file input manually if needed via ref, or just reload list
                document.querySelector('input[type="file"]').value = ""; 
                fetchPopups();
            }
        } catch (error) {
            console.error("Popup upload failed:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to create popup");
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/popups/${id}/status`, { is_active: !currentStatus });
            fetchPopups();
            toast.success("Status updated");
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const deletePopup = async (id) => {
        if (!window.confirm("Delete this popup?")) return;
        try {
            await api.delete(`/popups/${id}`);
            fetchPopups();
            toast.success("Deleted successfully");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <Layout>
            <h1 className="text-2xl font-bold text-[#064E3B] mb-6">Promotional Popups</h1>

            {/* Upload Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
                <h3 className="font-bold text-gray-800 mb-4">Add New Popup</h3>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Popup Image</label>
                        <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                    </div>
                    <div className="w-full md:w-1/3">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Redirect Link (Optional)</label>
                        <input type="text" placeholder="e.g. /products/mango-box" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className="w-full p-2 border rounded-lg text-sm outline-none focus:border-green-600"/>
                    </div>
                    <button type="submit" className="bg-[#064E3B] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#053d2e] transition">
                        <MdAdd /> Create
                    </button>
                </form>
                {preview && <img src={preview} alt="Preview" className="h-24 mt-4 rounded border object-contain" />}
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popups.map(popup => (
                    <div key={popup.id} className={`relative group border rounded-xl overflow-hidden shadow-sm ${popup.is_active ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'}`}>
                        <div className="h-48 bg-gray-100 relative">
                            <img src={`${API_BASE_URL}${popup.image_url}`} alt="Popup" className="w-full h-full object-contain" />
                            {popup.is_active ? (
                                <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">ACTIVE</span>
                            ) : (
                                <span className="absolute top-2 right-2 bg-gray-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">INACTIVE</span>
                            )}
                        </div>
                        
                        <div className="p-4 bg-white">
                            {popup.link_url && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 mb-3 truncate">
                                    <MdLink /> <a href={popup.link_url} target="_blank" rel="noreferrer">{popup.link_url}</a>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center mt-2">
                                <button 
                                    onClick={() => toggleStatus(popup.id, popup.is_active)}
                                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition ${
                                        popup.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                                    }`}
                                >
                                    {popup.is_active ? <><MdToggleOff size={16}/> Disable</> : <><MdToggleOn size={16}/> Enable</>}
                                </button>
                                
                                <button onClick={() => deletePopup(popup.id)} className="text-gray-400 hover:text-red-500 transition">
                                    <MdDelete size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default Popups;