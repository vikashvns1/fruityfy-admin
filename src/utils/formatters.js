export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
  }).format(value);
