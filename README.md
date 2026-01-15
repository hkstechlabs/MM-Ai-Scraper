# MM Scraper - Competitor Price Monitoring System

A comprehensive web scraping system that monitors competitor pricing data for Mobile Monster. The system fetches product mappings from Supabase, scrapes competitor websites, normalizes the data, and automatically updates variant pricing in the database.

## Overview

This scraper system automates the collection of pricing data from multiple competitors:
- **Reebelo** - Via API integration
- **Green Gadgets** - Via Shopify product JSON endpoints

The system uses dynamic SKU mappings from Supabase to ensure accurate product matching and automatically updates variant prices and stock levels in real-time.

## Features

- **Dynamic SKU Mapping** - Fetches product mappings from Supabase instead of hardcoded SKUs
- **Multi-Competitor Support** - Extensible architecture for adding new competitors
- **Data Normalization** - Unified data format across all competitors
- **Variant Tracking** - Maintains relationship between competitor SKUs and MM variants
- **Automated Database Updates** - Directly updates variant pricing and stock in Supabase
- **Price Aggregation** - Automatically selects lowest price per competitor
- **Stock Summation** - Totals available stock across all offers
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

The system connects to Supabase for two purposes:
1. Fetch product mappings from the `mappings` table
2. Update pricing and stock in the `variants` table

Configuration is in `services/supabase.js`:

```javascript
SUPABASE_BASE_URL: https://anmlzspuvlfqkvonnmdz.supabase.co/rest/v1
```

### Database Schema

#### Mappings Table

The `mappings` table structure:

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

#### Variants Table

The system updates these columns in the `variants` table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Primary key (variant ID) |
| `reebelo_price` | numeric(10,2) | Lowest Reebelo price |
| `greengadgets_price` | numeric(10,2) | Lowest Green Gadgets price |
| `reebelo_stock` | integer | Total Reebelo stock |
| `greengadgets_stock` | integer | Total Green Gadgets stock |

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
5. **Aggregate by Variant** - Groups prices by variant ID, selecting lowest prices
6. **Update Database** - Updates each variant with latest competitor pricing and stock

### Example Output

```
📥 Fetching mappings from Supabase...
✅ Loaded 1 mappings from Supabase
✅ reebelo scraped 1 prices
✅ green-gadgets scraped 60 prices

📊 Aggregating prices by variant...
📦 Found 1 variants to update
✅ Updated variant 1992

🎉 Update complete!
   ✅ Success: 1
   ❌ Errors: 0
```

## Data Flow

```
Supabase Mappings Table
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
  Aggregate by Variant
  (Lowest Price + Total Stock)
      ↓
  Update Supabase Variants
```

## Price Aggregation Logic

For each variant:
- **Price**: Takes the **lowest price** from each competitor (best deal for customers)
- **Stock**: **Sums up** all available stock from each competitor

Example:
```javascript
// Reebelo has 3 offers for variant 1992
Offer 1: $499.99, stock: 2
Offer 2: $457.99, stock: 0  ← Lowest price selected
Offer 3: $520.00, stock: 1

// Result stored in database
reebelo_price: 457.99
reebelo_stock: 3  // (2 + 0 + 1)
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

4. **Update Supabase**
   - Add column to `mappings` table (e.g., `new_competitor`)
   - Add columns to `variants` table (e.g., `new_competitor_price`, `new_competitor_stock`)
   - Update `transformMappings()` in `services/supabase.js`
   - Update `aggregateByVariant()` in `main.js`

## Roadmap

### Upcoming Features

- **AI-Powered Pricing Recommendations** - Machine learning model to suggest optimal pricing based on competitor data, market trends, and historical performance
- **Price History Tracking** - Store historical pricing data for trend analysis
- **Alert System** - Notifications for significant price changes
- **Dashboard** - Web interface for monitoring and analysis
- **Scheduled Runs** - Cron job integration for automated scraping
- **Multi-Currency Support** - Handle different currencies and conversions
- **Performance Metrics** - Track scraping success rates and timing

## Error Handling

- Each scraper runs independently - one failure doesn't stop others
- Errors are logged with scraper name and detailed error messages
- Empty mappings result in warning, not failure
- Database updates continue even if some variants fail
- Detailed error logging shows status codes and attempted data

## Logging

Console output includes:
- ✅ Success messages with item counts
- ❌ Error messages with details
- 📥 Data fetch operations
- 📊 Aggregation statistics
- 🎉 Summary with success/error counts

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

### Testing Supabase Updates

```javascript
const { updateVariant } = require('./services/supabase');

async function testUpdate() {
  await updateVariant(1992, {
    reebelo_price: 499.99,
    greengadgets_price: 849.00,
    reebelo_stock: 5,
    greengadgets_stock: 10,
  });
}

testUpdate();
```

## Troubleshooting

### Common Issues

**400 Bad Request Error**
- Check column types in Supabase (prices should be `numeric(10,2)`)
- Verify column names match exactly
- Check RLS policies allow updates

**No Prices Scraped**
- Verify mappings exist in Supabase
- Check competitor SKUs are correct
- Ensure API keys are valid

**Variant Not Updated**
- Confirm variant ID exists in variants table
- Check Supabase RLS policies
- Verify network connectivity

## License

ISC

## Author

Moiz

---

**Note:** This system is designed to scale. The modular architecture makes it easy to add new competitors, modify data formats, and integrate with additional services as the business grows.
