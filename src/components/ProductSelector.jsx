import ProductMiniCard from './ProductMiniCard';

export default function ProductSelector({
  categories,
  categoryId,
  setCategoryId,

  products,
  selectedProducts,

  add,
  remove,

  search,
  setSearch,

  page,
  setPage,
}) {
  return (
    <div className="space-y-4">

      {/* SELECTED PRODUCTS */}
      {selectedProducts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">
            Selected Products ({selectedProducts.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedProducts.map(p => (
              <ProductMiniCard
                key={`selected-${p.id}`}
                product={p}
                selected
                onRemove={() => remove(p.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* CATEGORY */}
      <select
        className="border p-2 rounded w-full"
        value={categoryId}
        onChange={e => {
          setCategoryId(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Add products from category</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* SEARCH */}
      {categoryId && (
        <input
          className="border p-2 rounded w-full"
          placeholder="Search products..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      )}

      {/* CATEGORY PRODUCTS */}
      {categoryId && (
        <div className="border rounded p-3 max-h-[420px] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {products.map(p => (
              <ProductMiniCard
                key={`list-${p.id}`}
                product={p}
                selected={selectedProducts.some(sp => sp.id === p.id)}
                onClick={() => add(p)}
              />
            ))}
          </div>

          {products.length >= 20 && (
            <button
              type="button"
              onClick={() => setPage(p => p + 1)}
              className="text-sm text-blue-600 mt-2"
            >
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
