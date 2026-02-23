export const getOrderStats = (stats) => ({
  total: stats?.order_stats?.total ?? stats?.total_orders ?? 0,
  pending: stats?.order_stats?.pending ?? 0,
  preparing: stats?.order_stats?.preparing ?? 0,
  delivered: stats?.order_stats?.delivered ?? 0,
});

export const getTopProducts = (stats) =>
  stats?.top_products ?? [
    { name: 'Apple', orders: 12, qty: 45 },
    { name: 'Banana', orders: 9, qty: 30 },
    { name: 'Mango', orders: 6, qty: 22 },
  ];

export const getStockStats = (stats) =>
  stats?.stock ?? {
    healthy: 64,
    low: 2,
    critical: 1,
    products: [
      { name: 'Apple', stock: 5 },
      { name: 'Orange', stock: 3 },
    ],
  };

export const getSLAStats = (stats) =>
  stats?.order_sla ?? {
    delayed: 1,
    breached: 1,
    on_time: 8,
  };
