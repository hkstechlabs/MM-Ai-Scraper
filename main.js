const axios = require('axios');
const scrapers = require('./scrapers');
const normalize = require('./normalize');  // import normalize middleware

const N8N_WEBHOOK_URL =
  'https://ozmobiles.app.n8n.cloud/webhook/data_ingestor';

async function sendToN8N(payload) {
  await axios.post(N8N_WEBHOOK_URL, payload, {
    timeout: 10000,
  });
}

async function main() {
  for (const scraper of scrapers) {
    try {
      // Run scraper, no context here as you said
      const result = await scraper.run();

      console.log(
        `✅ ${scraper.name} scraped`,
        result.prices.length,
        'prices'
      );

      // Normalize the raw result into unified format
      const normalizedData = normalize(scraper.name, result);
      console.log(normalizedData)

      // Send normalized data to n8n
      await sendToN8N({
        source: scraper.name,
        runAt: new Date().toISOString(),
        data: normalizedData,
      });

    } catch (err) {
      console.error(
        `❌ Error running scraper ${scraper.name}:`,
        err.message
      );
    }
  }
}

main().catch(err => {
  console.error('🔥 Fatal error:', err);
  process.exit(1);
});
