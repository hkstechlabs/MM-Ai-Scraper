const scrapers = require('./scrapers');
const normalize = require('./normalize');  // import normalize middleware
const { fetchMappings, transformMappings } = require('./services/supabase');
const fs = require('fs').promises;
const path = require('path');

async function main() {
  // Fetch mappings from Supabase first
  console.log('📥 Fetching mappings from Supabase...');
  const mappings = await fetchMappings();
  const transformedMappings = transformMappings(mappings);
  console.log(`✅ Loaded ${mappings.length} mappings from Supabase`);

  const allResults = [];

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
      
      allResults.push({
        source: scraper.name,
        scrapedAt: new Date().toISOString(),
        data: normalizedData,
      });

    } catch (err) {
      console.error(
        `❌ Error running scraper ${scraper.name}:`,
        err.message
      );
    }
  }

  // Write all results to a file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `scraper-results-${timestamp}.json`;
  const filepath = path.join(__dirname, 'results', filename);

  // Ensure results directory exists
  await fs.mkdir(path.join(__dirname, 'results'), { recursive: true });

  // Write the file
  await fs.writeFile(filepath, JSON.stringify(allResults, null, 2), 'utf8');
  
  console.log(`\n📝 Results written to: ${filepath}`);
  console.log(`📊 Total items scraped: ${allResults.reduce((sum, r) => sum + r.data.length, 0)}`);
}

main().catch(err => {
  console.error('🔥 Fatal error:', err);
  process.exit(1);
});
