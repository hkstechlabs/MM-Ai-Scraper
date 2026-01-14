const axios = require('axios');

class ReebeloScraper {
  constructor() {
    this.name = 'reebelo';

    this.apiUrl = 'https://a.reebelo.com/sockets/offers';
    this.apiKey = 'aCkLJ6izdU67cduknwGtfkzjj'; // TODO: move to env
    this.currency = 'AUD';

    // SKUs will be loaded from Supabase mappings
    this.skus = [];
    this.skuToVariant = {};
  }

  /**
   * Fetch all paginated offers for a single SKU
   */
  async fetchOffersBySku(sku) {
    let page = 1;
    let hasNextPage = true;
    const allOffers = [];

    while (hasNextPage) {
      try {
        const response = await axios.get(this.apiUrl, {
          headers: {
            'content-type': 'application/json',
            'x-api-key': this.apiKey,
          },
          params: {
            search: sku,
            page,
          },
        });

        const data = response.data;

        if (Array.isArray(data?.publishedOffers)) {
          allOffers.push(...data.publishedOffers);
        }

        hasNextPage = data?.hasNextPage === true;
        page += 1;

      } catch (error) {
        console.error(
          `❌ Reebelo API error for SKU ${sku} (page ${page})`
        );
        throw error;
      }
    }

    return allOffers;
  }

  /**
   * Main runner
   */
  async run(mappings) {
    // Load SKUs from Supabase mappings
    if (mappings && mappings.reebelo) {
      this.skus = mappings.reebelo.skus;
      this.skuToVariant = mappings.reebelo.skuToVariant;
    }

    if (this.skus.length === 0) {
      console.warn('⚠️ No Reebelo SKUs found in mappings');
      return {
        competitor: this.name,
        fetchedAt: new Date().toISOString(),
        skus: [],
        prices: [],
        rawResponses: {},
      };
    }

    const prices = [];
    const rawResponses = {};

    for (const sku of this.skus) {
      const offers = await this.fetchOffersBySku(sku);
      rawResponses[sku] = offers;

      // Get variant info from mapping
      const variantInfo = this.skuToVariant[sku] || {};

      for (const offer of offers) {
        const attrs = offer?.reebeloOffer?.attributes || {};

        prices.push({
          competitor: this.name,
          sku,

          price: offer.price,
          currency: this.currency,

          condition: attrs.condition,
          storage: attrs.storage,
          color: attrs.color,

          stock: offer?.reebeloOffer?.stock,
          isBest: attrs.isBest,
          isCheapest: attrs.isCheapest,

          sourceUrl: offer?.reebeloOffer?.url,
          
          // Supabase mapping info
          variantId: variantInfo.variantId,
          mmSku: variantInfo.mmSku,
          mappingId: variantInfo.mappingId,

          raw: offer,
        });
      }
    }

    return {
      competitor: this.name,
      fetchedAt: new Date().toISOString(),
      skus: this.skus,
      prices,
      rawResponses,
    };
  }
}

module.exports = ReebeloScraper;
