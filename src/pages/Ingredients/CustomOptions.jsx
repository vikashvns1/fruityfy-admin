import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { MdAdd, MdEdit, MdDelete, MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CustomOptions = () => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/juice/custom-options').then(res => {
            if (res.data.success) setOptions(res.data.data);
            setLoading(false);
        });
    }, []);

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Custom Options Manager</h1>
                    <p className="text-xs text-gray-500">Manage Add-ons like Sweetness, Packaging, and Toppings</p>
                </div>
                <button 
                    onClick={() => navigate('/options/add')}
                    className="bg-[#064E3B] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
                >
                    <MdAdd size={20} /> Add New Option
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Linked Product</th>
                            <th className="p-4">Option Name</th>
                            <th className="p-4">Selection Type</th>
                            <th className="p-4 text-center">Required</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-50">
                        {options.map(opt => (
                            <tr key={opt.id} className="hover:bg-gray-50/50">
                                <td className="p-4 font-bold text-[#064E3B]">{opt.product_name}</td>
                                <td className="p-4 font-medium">{opt.name}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${opt.type === 'single' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {opt.type}
                                    </span>
                                </td>
                                <td className="p-4 text-center">{opt.is_required ? '✅' : '❌'}</td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => navigate(`/options/edit/${opt.id}`)} className="p-2 text-gray-400 hover:text-blue-600"><MdEdit size={18} /></button>
                                    <button className="p-2 text-gray-400 hover:text-red-600"><MdDelete size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default CustomOptions;