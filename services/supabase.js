const axios = require('axios');

const SUPABASE_URL = 'https://anmlzspuvlfqkvonnmdz.supabase.co/rest/v1/mappings';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWx6c3B1dmxmcWt2b25ubWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzkzNDYsImV4cCI6MjA4MjExNTM0Nn0.reh9tYmfSsv96XOfHhvlICVtMTfAfwnIlXXvL-Ds4FM';
const SUPABASE_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWx6c3B1dmxmcWt2b25ubWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzkzNDYsImV4cCI6MjA4MjExNTM0Nn0.reh9tYmfSsv96XOfHhvlICVtMTfAfwnIlXXvL-Ds4FM';

/**
 * Fetch all mappings from Supabase
 * Returns array of mappings with structure:
 * {
 *   id: number,
 *   mm: string,
 *   reebelo: string,
 *   "green gadgets": string,
 *   variant: number
 * }
 */
async function fetchMappings() {
  try {
    const response = await axios.get(SUPABASE_URL, {
      headers: {
        'apiKey': SUPABASE_API_KEY,
        'Authorization': `Bearer ${SUPABASE_AUTH_TOKEN}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching mappings from Supabase:', error.message);
    throw error;
  }
}

/**
 * Transform mappings into a format useful for scrapers
 * Returns object with competitor-specific SKU arrays and variant tracking
 */
function transformMappings(mappings) {
  const reebeloSkus = [];
  const greenGadgetsSkus = [];
  const skuToVariant = {};

  for (const mapping of mappings) {
    // Reebelo mappings
    if (mapping.reebelo) {
      reebeloSkus.push(mapping.reebelo);
      skuToVariant[mapping.reebelo] = {
        variantId: mapping.variant,
        mmSku: mapping.mm,
        mappingId: mapping.id,
      };
    }

    // Green Gadgets mappings
    if (mapping['green gadgets']) {
      greenGadgetsSkus.push(mapping['green gadgets']);
      skuToVariant[mapping['green gadgets']] = {
        variantId: mapping.variant,
        mmSku: mapping.mm,
        mappingId: mapping.id,
      };
    }
  }

  return {
    reebelo: {
      skus: [...new Set(reebeloSkus)], // Remove duplicates
      skuToVariant,
    },
    greenGadgets: {
      productHandles: [...new Set(greenGadgetsSkus)], // Remove duplicates
      skuToVariant,
    },
  };
}

module.exports = {
  fetchMappings,
  transformMappings,
};
