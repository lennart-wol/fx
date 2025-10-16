// Very simple API endpoint to test Supabase connection
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
    console.log('Starting simple companies API call...');
    
    // Check if we have Supabase environment variables
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables not configured');
    }

    // Simple query to get just 5 companies
    const query = `${supabaseUrl}/rest/v1/companies?select=name,industry,country,fx_score&limit=5&order=id.asc`;
    
    console.log('Making request to:', query);
    
    const response = await fetch(query, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase error response:', errorText);
      throw new Error(`Supabase API error: ${response.status} - ${errorText}`);
    }

    const companies = await response.json();
    console.log('Companies received:', companies.length);

    res.status(200).json({
      success: true,
      companies: companies,
      message: `Successfully loaded ${companies.length} companies`,
      debug: {
        supabaseConfigured: true,
        responseStatus: response.status
      }
    });

  } catch (error) {
    console.error('Simple companies API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      debug: {
        supabaseUrl: process.env.SUPABASE_URL ? 'Present' : 'Missing',
        supabaseKey: process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing'
      }
    });
  }
}
