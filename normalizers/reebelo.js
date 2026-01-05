module.exports = function normalizeReebelo(result) {
  return result.prices.map(p => ({
    competitor: 'reebelo',
    sku: p.sku,
    price: p.price,
    currency: p.currency,
    condition: p.condition,
    storage: p.storage,
    color: p.color,
    stock: p.stock,
    sourceUrl: p.sourceUrl,
    fetchedAt: result.fetchedAt,
    raw: p.raw,
  }));
};
