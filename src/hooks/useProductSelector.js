import { useEffect, useState, useRef } from 'react';
import api from '../utils/api';

export function useProductSelector({ preselectedIds = [], deep = false }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // 🔐 Prevent overwrite loop
  const hydratedRef = useRef(false);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    api.get('/categories').then(res => {
      setCategories(res.data.data || []);
    });
  }, []);

  /* ================= LOAD PRODUCTS BY CATEGORY ================= */
  useEffect(() => {
    if (!categoryId) return;

    api.get('/products', {
      params: {
        category_id: categoryId,
        deep: deep ? 1 : 0,
        q: search,
        page,
        limit: 20,
      }
    }).then(res => {
      const data = res.data.data || [];
      setProducts(prev => (page === 1 ? data : [...prev, ...data]));
    });
  }, [categoryId, search, page, deep]);

  /* ================= PRELOAD SELECTED PRODUCTS (EDIT MODE) ================= */
  useEffect(() => {
    if (!preselectedIds.length) return;
    if (hydratedRef.current) return; // 🔥 ONLY ONCE

    api.get('/products/by-ids', {
      params: { ids: preselectedIds.join(',') }
    }).then(res => {
      const fetched = res.data.data || [];

      // 🔥 STRICTLY match DB ids order
      const map = new Map(fetched.map(p => [p.id, p]));
      const ordered = preselectedIds
        .map(id => map.get(id))
        .filter(Boolean);

      setSelectedProducts(ordered);
      hydratedRef.current = true; // 🔒 lock
    });
  }, [preselectedIds.join(',')]);

  /* ================= HELPERS ================= */
  const add = (product) => {
    setSelectedProducts(prev =>
      prev.some(p => p.id === product.id)
        ? prev
        : [...prev, product]
    );
  };

  const remove = (id) => {
    setSelectedProducts(prev =>
      prev.filter(p => p.id !== id)
    );
  };

  return {
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
  };
}
