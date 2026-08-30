import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('judge_reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const { reviewer_name, role_title, organization, rating, feedback, favorite_agent } = req.body || {};
      
      if (!reviewer_name || !feedback) {
        return res.status(400).json({ error: 'Name and feedback are required.' });
      }

      const newReview = {
        reviewer_name: String(reviewer_name).trim(),
        role_title: role_title ? String(role_title).trim() : 'Hackathon Judge',
        organization: organization ? String(organization).trim() : 'Independent Reviewer',
        rating: Number(rating) || 5,
        feedback: String(feedback).trim(),
        favorite_agent: favorite_agent || 'Triage Agent (gemini-3.1-pro)',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('judge_reviews')
        .insert(newReview)
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Reviews API error:', err);
    res.status(500).json({ error: err.message });
  }
}
