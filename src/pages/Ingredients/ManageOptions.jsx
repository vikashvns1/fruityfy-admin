import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MdArrowBack, MdSave, MdAdd , MdDelete, MdTune } from 'react-icons/md';

const ManageOptions = () => {
    const { id } = useParams(); // Edit mode ID
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // URL se productId aur source ('from') pakadne ke liye
    const urlProductId = searchParams.get('productId');
    const fromPath = searchParams.get('from') || '/options';

    const [optionData, setOptionData] = useState({
        product_id: urlProductId || '',
        name: '',
        type: 'single',
        is_required: 1,
        min_selection: 1,
        max_selection: 1
    });

    const [values, setValues] = useState([
        { name: '', price: 0, calories: 0, health_tag: '' }
    ]);

    useEffect(() => {
        // 1. Fetch customizable products for dropdown
        api.get('/products?product_type=customizable').then(res => {
            if (res.data.success) setProducts(res.data.data);
        });

        // 2. ⭐ Edit Logic: Existing data ko state mein load karna
        if (id) {
            api.get(`/juice/custom-options/${id}`).then(res => {
                if (res.data.success) {
                    const data = res.data.data;
                    setOptionData({
                        product_id: data.product_id,
                        name: data.name,
                        type: data.type,
                        is_required: data.is_required,
                        min_selection: data.min_selection,
                        max_selection: data.max_selection
                    });
                    // Database se aayi values ko state mein map karein (Health Tag ke saath)
                    setValues(data.values.map(v => ({
                        name: v.name,
                        price: v.price,
                        calories: v.calories,
                        health_tag: v.health_tag || ''
                    })));
                }
            });
        }
    }, [id]);

    const handleTypeChange = (newType) => {
        setOptionData({
            ...optionData, 
            type: newType,
            max_selection: newType === 'single' ? 1 : 5 
        });
    };

    const addValueRow = () => {
        setValues([...values, { name: '', price: 0, calories: 0, health_tag: '' }]);
    };

    const removeValueRow = (index) => {
        if (values.length > 1) {
            setValues(values.filter((_, i) => i !== index));
        }
    };

    const handleValueChange = (index, field, val) => {
        const updated = [...values];
        updated[index][field] = val;
        setValues(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!optionData.product_id) return toast.error("Please select a juice template!");
        
        setSubmitting(true);
        try {
            const payload = { ...optionData, values };
            const url = id ? `/juice/custom-options/${id}` : '/juice/custom-options';
            const res = await api.post(url, payload); 
            
            if (res.data.success) {
                toast.success(id ? "Configuration Updated!" : "Customization Published!");
                // Navigation Logic: Agar Mapping page se aaye hain toh wahi jayein
                if (fromPath === '/mapping' || urlProductId) {
                    navigate(`/mapping?productId=${optionData.product_id}`);
                } else {
                    navigate('/options');
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 bg-white border rounded-xl shadow-sm hover:bg-gray-50 transition"
                    >
                        <MdArrowBack size={24}/>
                    </button>
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-[#064E3B]">
                            {id ? 'Refine Custom Option' : 'New Custom Option'}
                        </h1>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Fruityfy Lab Configuration</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Header Section */}
                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-[#064E3B] uppercase mb-2 tracking-wider">Target Juice Template</label>
                                <select 
                                    className="w-full p-3.5 border-2 border-gray-50 rounded-2xl outline-none focus:border-[#FACC15] bg-gray-50 transition-all font-bold text-[#064E3B]"
                                    value={optionData.product_id}
                                    onChange={(e) => setOptionData({...optionData, product_id: e.target.value})}
                                    required
                                >
                                    <option value="">-- Choose Template --</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-[#064E3B] uppercase mb-2 tracking-wider">Option Title</label>
                                <input 
                                    type="text" placeholder="e.g. Sweetness Level"
                                    className="w-full p-3.5 border-2 border-gray-50 rounded-2xl outline-none focus:border-[#FACC15] bg-gray-50 transition-all font-bold"
                                    value={optionData.name}
                                    onChange={(e) => setOptionData({...optionData, name: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-8 items-center p-6 bg-[#064E3B]/5 rounded-2xl border border-[#064E3B]/10">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={optionData.is_required === 1} 
                                    onChange={(e) => setOptionData({...optionData, is_required: e.target.checked ? 1 : 0})} 
                                    className="w-5 h-5 accent-[#064E3B]"
                                />
                                <span className="text-sm font-black text-[#064E3B] uppercase tracking-tighter">Compulsory Choice</span>
                            </label>

                            <div className="flex items-center gap-4">
                                <span className="text-sm font-black text-[#064E3B] uppercase tracking-tighter">UI Component:</span>
                                <div className="flex p-1 bg-white border rounded-xl shadow-inner">
                                    <button type="button" onClick={() => handleTypeChange('single')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${optionData.type === 'single' ? 'bg-[#064E3B] text-white' : 'text-gray-400'}`}>Radio</button>
                                    <button type="button" onClick={() => handleTypeChange('multi')} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${optionData.type === 'multi' ? 'bg-[#064E3B] text-white' : 'text-gray-400'}`}>Checkbox</button>
                                </div>
                            </div>

                            {optionData.type === 'multi' && (
                                <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <span className="text-sm font-black text-[#064E3B] uppercase">Limit:</span>
                                    <input type="number" className="w-20 p-2 border-2 rounded-xl text-center font-bold outline-none focus:border-[#064E3B]" value={optionData.max_selection} onChange={(e) => setOptionData({...optionData, max_selection: e.target.value})} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold text-[#064E3B] flex items-center gap-3 text-xl leading-none">
                                <MdTune className="text-2xl text-[#FACC15]"/> Choice Variations
                            </h3>
                            <button type="button" onClick={addValueRow} className="text-[10px] bg-[#064E3B] text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-md">+ Add New Row</button>
                        </div>

                        <div className="space-y-4">
                            {values.map((v, i) => (
                                <div key={i} className="flex flex-wrap md:flex-nowrap gap-4 items-end p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-[#064E3B]/10 transition-all group relative">
                                    <div className="flex-1 min-w-[180px]">
                                        <label className="text-[9px] uppercase font-black text-gray-400 mb-2 block tracking-widest">Variation Name</label>
                                        <input type="text" placeholder="e.g. Extra Honey" className="w-full p-3 text-sm border-2 border-white rounded-xl bg-white outline-none focus:border-[#064E3B] font-bold shadow-sm" value={v.name} onChange={(e) => handleValueChange(i, 'name', e.target.value)} required />
                                    </div>
                                    {/* ⭐ RE-ADDED HEALTH TAG FIELD */}
                                    <div className="w-48">
                                        <label className="text-[9px] uppercase font-black text-gray-400 mb-2 block tracking-widest">Health Tag</label>
                                        <input type="text" placeholder="e.g. Low GI" className="w-full p-3 text-sm border-2 border-white rounded-xl bg-white outline-none focus:border-[#064E3B] font-bold shadow-sm" value={v.health_tag} onChange={(e) => handleValueChange(i, 'health_tag', e.target.value)} />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[9px] uppercase font-black text-gray-400 mb-2 block tracking-widest text-center">Price (+₹)</label>
                                        <input type="number" className="w-full p-3 text-sm border-2 border-white rounded-xl bg-white outline-none focus:border-[#064E3B] text-center font-bold" value={v.price} onChange={(e) => handleValueChange(i, 'price', e.target.value)} />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[9px] uppercase font-black text-gray-400 mb-2 block tracking-widest text-center">Calories</label>
                                        <input type="number" className="w-full p-3 text-sm border-2 border-white rounded-xl bg-white outline-none focus:border-[#064E3B] text-center font-bold" value={v.calories} onChange={(e) => handleValueChange(i, 'calories', e.target.value)} />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeValueRow(i)} 
                                        className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all mb-1 active:scale-90"
                                    >
                                        <MdDelete size={22}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end sticky bottom-8 z-20">
                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="bg-gradient-to-r from-[#064E3B] to-[#043328] text-white px-16 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_40px_-15px_rgba(6,78,59,0.4)] hover:scale-[1.02] transition-all flex items-center gap-4 active:scale-95 disabled:grayscale"
                        >
                            <MdSave size={24} className="text-[#FACC15]"/> 
                            {submitting ? "Processing Lab Data..." : "Commit Configuration"}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </Layout>
    );
};

export default ManageOptions;