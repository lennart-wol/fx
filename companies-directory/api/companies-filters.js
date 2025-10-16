// Vercel serverless function for companies filters API
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Supabase configuration
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pwwbemvdjaezgwxdosbg.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    
    if (!SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    // Get unique industries
    const industriesResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=industry&industry=not.is.null&industry=neq.`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const industriesData = await industriesResponse.json();
    const industries = [...new Set(industriesData.map(item => item.industry))].filter(Boolean).sort();

    // Get unique countries
    const countriesResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=country&country=not.is.null&country=neq.`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const countriesData = await countriesResponse.json();
    const countries = [...new Set(countriesData.map(item => item.country))].filter(Boolean).sort();

    res.status(200).json({
      success: true,
      filters: {
        industries: industries,
        countries: countries
      }
    });

  } catch (error) {
    console.error('Companies filters API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch filter options'
    });
  }
}
