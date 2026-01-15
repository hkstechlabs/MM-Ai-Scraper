const axios = require('axios');

const SUPABASE_BASE_URL = 'https://anmlzspuvlfqkvonnmdz.supabase.co/rest/v1';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWx6c3B1dmxmcWt2b25ubWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzkzNDYsImV4cCI6MjA4MjExNTM0Nn0.reh9tYmfSsv96XOfHhvlICVtMTfAfwnIlXXvL-Ds4FM';
const SUPABASE_AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFubWx6c3B1dmxmcWt2b25ubWR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzkzNDYsImV4cCI6MjA4MjExNTM0Nn0.reh9tYmfSsv96XOfHhvlICVtMTfAfwnIlXXvL-Ds4FM';

const headers = {
  'apiKey': SUPABASE_API_KEY,
  'Authorization': `Bearer ${SUPABASE_AUTH_TOKEN}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

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
    const response = await axios.get(`${SUPABASE_BASE_URL}/mappings`, {
      headers,
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

/**
 * Update variant pricing and stock information
 * @param {number} variantId - The variant ID to update
 * @param {object} updates - Object containing fields to update
 * @param {number} updates.reebelo_price - Reebelo price (decimal)
 * @param {number} updates.greengadgets_price - Green Gadgets price (decimal)
 * @param {number} updates.reebelo_stock - Reebelo stock (integer)
 * @param {number} updates.greengadgets_stock - Green Gadgets stock (integer)
 */
async function updateVariant(variantId, updates) {
  try {
    const response = await axios.patch(
      `${SUPABASE_BASE_URL}/variants?id=eq.${variantId}`,
      updates,
      { headers }
    );
    return true;
  } catch (error) {
    console.error(`❌ Error updating variant ${variantId}:`, error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      console.error('   Attempted update:', JSON.stringify(updates, null, 2));
    }
    throw error;
  }
}

module.exports = {
  fetchMappings,
  transformMappings,
  updateVariant,
};
