import { useState, useEffect } from 'react';
import Layout from "../../components/Layout";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { MdSettings, MdCheckCircle, MdOutlineCheckBoxOutlineBlank, MdSave, MdArrowBack } from "react-icons/md";
import { useLocation, useNavigate } from 'react-router-dom'; 

const ProductMapping = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialProductId = queryParams.get('productId');
  
  // ⭐ Get navigation state to know where we came from
  const fromPage = location.state?.from || null;

  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [mappedIds, setMappedIds] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, ingRes] = await Promise.all([
          api.get('/products'), 
          api.get('/juice/ingredients')
        ]);
        const customProducts = prodRes.data.data.filter(p => p.product_type === 'customizable');
        setProducts(customProducts);
        setIngredients(ingRes.data.data);

        if (initialProductId) {
          setSelectedProduct(initialProductId);
        }
      } catch (err) {
        toast.error("Failed to load initial data");
      }
    };
    fetchData();
  }, [initialProductId]);

  useEffect(() => {
    if (selectedProduct) {
      api.get(`/juice/builder/${selectedProduct}`).then(res => {
        if (res.data.success) {
          const existing = Object.values(res.data.data.ingredients).flat().map(i => i.id);
          setMappedIds(existing);
        }
      }).catch(() => setMappedIds([]));
    } else {
        setMappedIds([]);
    }
  }, [selectedProduct]);

  const toggleIngredient = (id) => {
    setMappedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const saveMapping = async () => {
    if (!selectedProduct) return toast.warning("Select a product first");
    setLoading(true);
    try {
      await api.post('/juice/mapping', {
        product_id: selectedProduct,
        ingredient_ids: mappedIds
      });
      toast.success("Mapping updated successfully!");
    } catch (err) {
      toast.error("Failed to update mapping");
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Back Logic: Jahan se aaye wahi bhejega
  const handleBack = () => {
    if (fromPage) {
        navigate(fromPage);
    } else {
        navigate(-1); // Fallback to browser back
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {/* ⭐ Show Back button only if we came from another page */}
            {fromPage && (
                <button 
                    onClick={handleBack}
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 shadow-sm transition-colors"
                >
                    <MdArrowBack size={20} />
                </button>
            )}
            <div>
                <h1 className="text-2xl font-serif font-bold text-[#064E3B]">Juice Builder Configurator</h1>
                <p className="text-sm text-gray-500">Link ingredients to templates</p>
            </div>
          </div>
          <button 
            onClick={saveMapping} disabled={loading || !selectedProduct}
            className="bg-[#064E3B] text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg disabled:opacity-50"
          >
            <MdSave size={20} /> {loading ? "Saving..." : "Save Configuration"}
          </button>
        </div>

        {/* ... Rest of your UI code remains same ... */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-8 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2 font-serif uppercase tracking-wider">Select Customizable Product</label>
          <select 
            className="w-full p-3 border rounded-xl outline-none focus:border-[#064E3B] bg-white font-medium text-[#064E3B]"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">-- Choose a Juice Template --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Base: ₹{p.price})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['fruit', 'vegetable', 'liquid', 'booster'].map(type => (
            <div key={type} className="space-y-4">
              <h3 className="capitalize font-bold text-[#064E3B] border-b border-[#064E3B]/20 pb-2 flex items-center gap-2">
                <MdSettings className="text-orange-400" /> {type}s
              </h3>
              <div className="space-y-2">
                {ingredients.filter(ing => ing.type === type).map(ing => (
                  <div 
                    key={ing.id}
                    onClick={() => toggleIngredient(ing.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                        mappedIds.includes(ing.id) 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : 'bg-white border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    {mappedIds.includes(ing.id) ? (
                        <MdCheckCircle className="text-[#064E3B]" size={20} /> 
                    ) : (
                        <MdOutlineCheckBoxOutlineBlank className="text-gray-300" size={20} />
                    )}
                    <span className={`text-sm font-medium ${mappedIds.includes(ing.id) ? 'text-[#064E3B]' : 'text-gray-600'}`}>
                        {ing.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductMapping;