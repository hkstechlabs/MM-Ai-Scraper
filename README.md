# MM Scraper - Competitor Price Monitoring System

A comprehensive web scraping system that monitors competitor pricing data for Mobile Monster. The system fetches product mappings from Supabase, scrapes competitor websites, normalizes the data, and stores results for analysis.

## Overview

This scraper system automates the collection of pricing data from multiple competitors:
- **Reebelo** - Via API integration
- **Green Gadgets** - Via Shopify product JSON endpoints

The system uses dynamic SKU mappings from Supabase to ensure accurate product matching and tracks variant IDs for future price updates.

## Features

- **Dynamic SKU Mapping** - Fetches product mappings from Supabase instead of hardcoded SKUs
- **Multi-Competitor Support** - Extensible architecture for adding new competitors
- **Data Normalization** - Unified data format across all competitors
- **Variant Tracking** - Maintains relationship between competitor SKUs and MM variants
- **Automated Results Storage** - Timestamped JSON files for each scraping run
- **Error Handling** - Graceful failure handling per scraper

## Architecture

```
mm-scraper/
├── main.js                 # Main orchestrator
├── scrapers/              # Competitor-specific scrapers
│   ├── BaseScraper.js     # Base class with common functionality
│   ├── ReebeloScraper.js  # Reebelo API scraper
│   ├── GreenGadgetsScraper.js  # Green Gadgets scraper
│   └── index.js           # Scraper registry
├── normalizers/           # Data normalization layer
│   ├── reebelo.js         # Reebelo data normalizer
│   ├── greengadgets.js    # Green Gadgets normalizer
│   └── index.js           # Normalizer registry
├── services/              # External service integrations
│   └── supabase.js        # Supabase API client
├── results/               # Output directory for scraped data
└── MM Mapper/             # Brand logo assets
```

## Installation

```bash
npm install
```

### Dependencies

- **axios** - HTTP client for API requests
- **playwright** - Browser automation (for future HTML scraping needs)

## Configuration

### Supabase Setup

The system connects to Supabase to fetch product mappings. Configuration is in `services/supabase.js`:

```javascript
SUPABASE_URL: https://anmlzspuvlfqkvonnmdz.supabase.co/rest/v1/mappings
```

### Mappings Table Structure

The Supabase `mappings` table should have the following structure:

```json
{
  "id": 7789,
  "created_at": "2026-01-14T06:33:00.854418+00:00",
  "mm": "IPH17PROMAX256ORGNIB",
  "reebelo": "APPLE-IPHONE-11-PRO-256GB-SPACE-GREY-EX-DISPLAYDEMO",
  "green gadgets": "apple-iphone-17-pro-max",
  "variant": 1992
}
```

## Usage

Run the scraper:

```bash
node main.js
```

### What Happens

1. **Fetch Mappings** - Retrieves all product mappings from Supabase
2. **Transform Data** - Organizes mappings by competitor
3. **Run Scrapers** - Each scraper fetches data for its mapped SKUs
4. **Normalize Data** - Converts raw data to unified format
5. **Save Results** - Writes timestamped JSON file to `results/` directory

### Output

Results are saved as `results/scraper-results-{timestamp}.json`:

```json
[
  {
    "source": "reebelo",
    "scrapedAt": "2026-01-14T12:30:45.123Z",
    "data": [
      {
        "competitor": "reebelo",
        "sku": "APPLE-IPHONE-11-PRO-256GB-SPACE-GREY-EX-DISPLAYDEMO",
        "price": 899.99,
        "currency": "AUD",
        "condition": "Excellent",
        "storage": "256GB",
        "color": "Space Grey",
        "stock": 5,
        "variantId": 1992,
        "mmSku": "IPH17PROMAX256ORGNIB",
        "mappingId": 7789,
        "sourceUrl": "https://...",
        "fetchedAt": "2026-01-14T12:30:45.123Z"
      }
    ]
  },
  {
    "source": "green-gadgets",
    "scrapedAt": "2026-01-14T12:30:50.456Z",
    "data": [...]
  }
]
```

## Data Flow

```
Supabase Mappings
      ↓
Transform Mappings
      ↓
┌─────────────┬─────────────┐
│   Reebelo   │ Green Gadgets│
│   Scraper   │   Scraper    │
└─────────────┴─────────────┘
      ↓              ↓
┌─────────────┬─────────────┐
│   Reebelo   │ Green Gadgets│
│ Normalizer  │  Normalizer  │
└─────────────┴─────────────┘
      ↓              ↓
    Unified Data Format
      ↓
  JSON File Output
```

## Normalized Data Schema

Each price record includes:

| Field | Type | Description |
|-------|------|-------------|
| `competitor` | string | Competitor name |
| `sku` | string | Competitor's SKU |
| `price` | number | Current price |
| `currency` | string | Currency code (AUD) |
| `condition` | string | Product condition |
| `storage` | string | Storage capacity |
| `color` | string | Product color |
| `stock` | number | Available stock |
| `variantId` | number | MM variant ID from Supabase |
| `mmSku` | string | Mobile Monster SKU |
| `mappingId` | number | Supabase mapping record ID |
| `sourceUrl` | string | Source URL |
| `fetchedAt` | string | ISO timestamp |

## Adding New Scrapers

1. **Create Scraper Class** in `scrapers/`
   ```javascript
   class NewCompetitorScraper extends BaseScraper {
     constructor() {
       super('new-competitor');
     }
     
     async run(mappings) {
       // Implement scraping logic
       // Use mappings.newCompetitor.skus
       // Return prices with variantId, mmSku, mappingId
     }
   }
   ```

2. **Create Normalizer** in `normalizers/`
   ```javascript
   module.exports = function normalizeNewCompetitor(result) {
     return result.prices.map(p => ({
       competitor: 'new-competitor',
       // ... map fields to unified schema
       variantId: p.variantId,
       mmSku: p.mmSku,
       mappingId: p.mappingId,
     }));
   };
   ```

3. **Register Both**
   - Add to `scrapers/index.js`
   - Add to `normalizers/index.js`

4. **Update Supabase Service**
   - Add column to mappings table
   - Update `transformMappings()` in `services/supabase.js`

## Roadmap

### Upcoming Features

- **AI-Powered Pricing Recommendations** - Machine learning model to suggest optimal pricing based on competitor data, market trends, and historical performance
- **Automated Price Updates** - Direct integration with MM variants API to update prices
- **Price History Tracking** - Store historical pricing data for trend analysis
- **Alert System** - Notifications for significant price changes
- **Dashboard** - Web interface for monitoring and analysis
- **Scheduled Runs** - Cron job integration for automated scraping

## Error Handling

- Each scraper runs independently - one failure doesn't stop others
- Errors are logged with scraper name and message
- Empty mappings result in warning, not failure
- Results are saved even if some scrapers fail

## Logging

Console output includes:
- ✅ Success messages with item counts
- ❌ Error messages with details
- 📥 Data fetch operations
- 📝 File write confirmations
- 📊 Summary statistics

## Development

### Testing Individual Scrapers

```javascript
const ReebeloScraper = require('./scrapers/ReebeloScraper');
const { fetchMappings, transformMappings } = require('./services/supabase');

async function test() {
  const mappings = await fetchMappings();
  const transformed = transformMappings(mappings);
  
  const scraper = new ReebeloScraper();
  const result = await scraper.run(transformed);
  console.log(result);
}

test();
```

### Debugging

Enable detailed logging by uncommenting console.log statements in normalizers or adding debug output in scrapers.

## License

ISC

## Author

Abdul Mueez

---

**Note:** This system is designed to scale. The modular architecture makes it easy to add new competitors, modify data formats, and integrate with additional services as the business grows.
