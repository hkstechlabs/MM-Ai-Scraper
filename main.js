const scrapers = require('./scrapers');
const normalize = require('./normalize');  // import normalize middleware
const { fetchMappings, transformMappings, updateVariant } = require('./services/supabase');

/**
 * Aggregate prices by variant ID
 * Takes normalized data and groups by variantId, calculating best prices and total stock
 */
function aggregateByVariant(allNormalizedData) {
  const variantMap = new Map();

  for (const item of allNormalizedData) {
    const { variantId, competitor, price, stock } = item;

    if (!variantId) continue; // Skip items without variant mapping

    if (!variantMap.has(variantId)) {
      variantMap.set(variantId, {
        variantId,
        reebelo_price: null,
        greengadgets_price: null,
        reebelo_stock: null,
        greengadgets_stock: null,
      });
    }

    const variant = variantMap.get(variantId);

    // Update competitor-specific fields
    if (competitor === 'reebelo') {
      // Take the lowest price if multiple offers exist
      if (variant.reebelo_price === null || price < variant.reebelo_price) {
        variant.reebelo_price = price;
      }
      // Sum up stock
      variant.reebelo_stock = (variant.reebelo_stock || 0) + (stock || 0);
    } else if (competitor === 'green-gadgets') {
      // Take the lowest price if multiple offers exist
      if (variant.greengadgets_price === null || price < variant.greengadgets_price) {
        variant.greengadgets_price = price;
      }
      // Sum up stock
      variant.greengadgets_stock = (variant.greengadgets_stock || 0) + (stock || 0);
    }
  }

  return Array.from(variantMap.values());
}

async function main() {
  // Fetch mappings from Supabase first
  console.log('📥 Fetching mappings from Supabase...');
  const mappings = await fetchMappings();
  const transformedMappings = transformMappings(mappings);
  console.log(`✅ Loaded ${mappings.length} mappings from Supabase`);

  const allNormalizedData = [];

  for (const scraper of scrapers) {
    try {
      // Pass mappings to scraper
      const result = await scraper.run(transformedMappings);

      console.log(
        `✅ ${scraper.name} scraped`,
        result.prices.length,
        'prices'
      );

      // Normalize the raw result into unified format
      const normalizedData = normalize(scraper.name, result);
      allNormalizedData.push(...normalizedData);

    } catch (err) {
      console.error(
        `❌ Error running scraper ${scraper.name}:`,
        err.message
      );
    }
  }

  // Aggregate data by variant
  console.log('\n📊 Aggregating prices by variant...');
  const variantUpdates = aggregateByVariant(allNormalizedData);
  console.log(`📦 Found ${variantUpdates.length} variants to update`);

  // Update each variant in Supabase
  let successCount = 0;
  let errorCount = 0;

  for (const update of variantUpdates) {
    try {
      const { variantId, ...fields } = update;
      await updateVariant(variantId, fields);
      successCount++;
      console.log(`✅ Updated variant ${variantId}`);
    } catch (err) {
      errorCount++;
      console.error(`❌ Failed to update variant ${update.variantId}:`, err.message);
    }
  }

  console.log(`\n🎉 Update complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

main().catch(err => {
  console.error('🔥 Fatal error:', err);
  process.exit(1);
});
