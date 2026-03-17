import { MdClose } from 'react-icons/md';
import {API_BASE_URL} from '../utils/api'; // Import the base URL from api.js
const IMAGE_BASE = API_BASE_URL;

export default function ProductMiniCard({
  product,
  selected = false,
  onClick,
  onRemove
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 p-2 border rounded cursor-pointer
        ${selected ? 'border-green-600 bg-green-50' : 'hover:bg-gray-50'}
      `}
    >
      <img
        src={IMAGE_BASE + product.image_url}
        alt={product.name}
        className="h-10 w-10 rounded object-cover"
      />

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{product.name}</div>
        <div className={`text-xs ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {product.stock_quantity > 0
            ? `In stock (${product.stock_quantity})`
            : 'Out of stock'}
        </div>
      </div>

      {selected && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-red-600"
        >
          <MdClose />
        </button>
      )}
    </div>
  );
}
