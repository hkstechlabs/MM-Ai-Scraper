const axios = require('axios');
const BaseScraper = require('./BaseScraper');

class GreenGadgetsScraper extends BaseScraper {
  constructor() {
    super('green-gadgets');

    // 🔑 GreenGadgets owns its own product endpoints
    this.productUrls = [
      'https://shop.greengadgets.net.au/products/apple-iphone-17-pro-max.json',
    ];
  }

  async run() {
    const prices = [];
    const rawProducts = [];

    for (const url of this.productUrls) {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json',
        },
      });

      const product = response.data?.product;
      if (!product || !Array.isArray(product.variants)) {
        throw new Error('Invalid product JSON structure');
      }

      rawProducts.push(product);

      for (const variant of product.variants) {
        prices.push({
          competitor: this.name,
          fetchedAt: new Date().toISOString(),

          product_handle: product.handle,
          product_title: product.title,

          sku: variant.sku,
          variant_id: variant.id,

          storage: variant.option1,
          color: variant.option2,
          condition: variant.option3,

          price: Number(variant.price),
          currency: variant.price_currency || 'AUD',

          compare_at_price: variant.compare_at_price
            ? Number(variant.compare_at_price)
            : null,

          available: true,
          sourceUrl: url,
        });
      }
    }

    return {
      competitor: this.name,
      fetchedAt: new Date().toISOString(),
      prices,
      rawProducts,
    };
  }
}

module.exports = GreenGadgetsScraper;
