/**
 * Fetch Stitch design export
 * Calls Stitch API and saves export to frontend/stitch/stitch-export.json
 * 
 * Usage: STITCH_API_KEY=your_key node scripts/fetch-stitch.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// NEVER hardcode API key - always use environment variable
const STITCH_API_KEY = process.env.STITCH_API_KEY;
const STITCH_API_URL = 'https://stitch.googleapis.com/mcp';

if (!STITCH_API_KEY) {
  console.error('❌ Error: STITCH_API_KEY environment variable is required');
  console.log('\nUsage:');
  console.log('  STITCH_API_KEY=your_key node scripts/fetch-stitch.js');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'frontend', 'stitch');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'stitch-export.json');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Make request to Stitch API
const options = {
  method: 'GET',
  headers: {
    'X-Goog-Api-Key': STITCH_API_KEY,
    'Content-Type': 'application/json',
  },
};

console.log('🔄 Fetching Stitch export...');

https.get(STITCH_API_URL, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error(`❌ API request failed with status ${res.statusCode}`);
      console.error(data);
      process.exit(1);
    }

    try {
      const jsonData = JSON.parse(data);
      
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(jsonData, null, 2));
      
      console.log('✅ Stitch export saved successfully!');
      console.log(`   Output: ${OUTPUT_FILE}`);
      console.log('\nNext steps:');
      console.log('  1. Run: node scripts/convert-stitch-to-next.js');
      console.log('  2. Review generated components in frontend/components/stitch/');
    } catch (error) {
      console.error('❌ Failed to parse API response:', error.message);
      process.exit(1);
    }
  });
}).on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  process.exit(1);
});
