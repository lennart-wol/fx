// Vercel serverless function for companies API
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { limit = 20, offset = 0, industry, country, minScore } = req.query;
    
    // Supabase configuration
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pwwbemvdjaezgwxdosbg.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    
    if (!SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    // Build query
    let query = `${SUPABASE_URL}/rest/v1/companies?select=*&limit=${limit}&offset=${offset}`;
    
    // Add filters
    if (industry && industry !== 'all') {
      query += `&industry=eq.${encodeURIComponent(industry)}`;
    }
    if (country && country !== 'all') {
      query += `&country=eq.${encodeURIComponent(country)}`;
    }
    if (minScore) {
      query += `&fx_score=gte.${minScore}`;
    }
    
    // Add ordering
    query += '&order=fx_score.desc.nullslast,name.asc';

    const response = await fetch(query, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status}`);
    }

    const companies = await response.json();
    
    // Get total count for pagination
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    const countData = await countResponse.json();
    const totalCount = countData.length > 0 ? countData[0].count : 0;

    res.status(200).json({
      success: true,
      companies: companies,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + companies.length < totalCount
      }
    });

  } catch (error) {
    console.error('Companies API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch companies'
    });
  }
}
