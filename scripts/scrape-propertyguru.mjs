import { createInterface } from 'readline';

const API_KEY = process.env.TINY_FISH_API_KEY;
const BASE_URL = 'https://agent.tinyfish.ai/v1';

if (!API_KEY) {
  console.error('Missing TINY_FISH_API_KEY in environment');
  process.exit(1);
}

async function scrapePropertyGuru() {
  console.log('Querying PropertyGuru for properties priced SGD 5,000+...\n');

  const payload = {
    url: 'https://www.propertyguru.com.sg/property-for-rent?minprice=5000',
    goal: 'Extract property listings from this page. For each listing, collect: property name/title, price (monthly rent), location/address, number of bedrooms, number of bathrooms, floor area (sqft), and property URL. Return as a JSON array of objects.',
    browser_profile: 'stealth',
    proxy_config: { enabled: true, country_code: 'AU' },
  };

  const response = await fetch(`${BASE_URL}/automation/run-sse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`API error ${response.status}:`, err);
    process.exit(1);
  }

  // Parse SSE stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (!raw || raw === '[DONE]') continue;

      try {
        const event = JSON.parse(raw);
        console.log('RAW EVENT:', JSON.stringify(event, null, 2));

        if (event.result_json) {
          result = event.result_json;
        } else if (event.type === 'result' || event.status === 'completed') {
          result = event.result ?? event.data ?? event;
        } else if (event.type === 'COMPLETE' || event.status === 'COMPLETE') {
          result = event.result ?? event.data ?? event.output ?? event;
        }
      } catch {
        // non-JSON line, skip
      }
    }
  }

  if (result) {
    console.log('\n--- Results ---');
    const listings = typeof result === 'string' ? JSON.parse(result) : result;
    if (Array.isArray(listings)) {
      listings.forEach((l, i) => {
        console.log(`\n[${i + 1}] ${l.title ?? l.name ?? 'Listing'}`);
        console.log(`    Price    : ${l.price ?? l.rent ?? 'N/A'}`);
        console.log(`    Location : ${l.location ?? l.address ?? 'N/A'}`);
        console.log(`    Bedrooms : ${l.bedrooms ?? l.beds ?? 'N/A'}`);
        console.log(`    Bathrooms: ${l.bathrooms ?? l.baths ?? 'N/A'}`);
        console.log(`    Area     : ${l.floor_area ?? l.area ?? l.size ?? 'N/A'}`);
        console.log(`    URL      : ${l.url ?? l.link ?? 'N/A'}`);
      });
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    console.log('\nNo structured result returned.');
  }
}

scrapePropertyGuru().catch(console.error);
