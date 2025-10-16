// Vercel serverless function for companies stats API
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

    // Get total companies count
    const totalResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=count`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    const totalData = await totalResponse.json();
    const totalCompanies = totalData.length > 0 ? totalData[0].count : 0;

    // Get high FX score count (8+)
    const highScoreResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=count&fx_score=gte.8`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    const highScoreData = await highScoreResponse.json();
    const highScoreCount = highScoreData.length > 0 ? highScoreData[0].count : 0;

    // Get companies with FX scores for average calculation
    const scoresResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=fx_score&fx_score=not.is.null`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const scoresData = await scoresResponse.json();
    const avgScore = scoresData.length > 0 
      ? (scoresData.reduce((sum, company) => sum + (company.fx_score || 0), 0) / scoresData.length).toFixed(1)
      : 0;

    // Get companies with LinkedIn profiles
    const linkedinResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies?select=count&linkedin_url=not.is.null`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    });
    
    const linkedinData = await linkedinResponse.json();
    const linkedinCount = linkedinData.length > 0 ? linkedinData[0].count : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalCompanies: totalCompanies,
        avgFxScore: parseFloat(avgScore),
        highScoreCount: highScoreCount,
        linkedinProfiles: linkedinCount
      }
    });

  } catch (error) {
    console.error('Companies stats API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch company statistics'
    });
  }
}
