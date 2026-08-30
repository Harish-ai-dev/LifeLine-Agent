import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { count, error } = await supabase
        .from('waitlist_signups')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return res.status(200).json({ totalSignups: count || 0 });
    }

    if (req.method === 'POST') {
      const { full_name, email, organization_type, organization_name, role, interest_area, notes } = req.body || {};

      if (!email || !full_name) {
        return res.status(400).json({ error: 'Name and email are required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      const newSignup = {
        full_name: String(full_name).trim(),
        email: String(email).trim().toLowerCase(),
        organization_type: organization_type || 'EMS Agency',
        organization_name: organization_name ? String(organization_name).trim() : 'N/A',
        role: role ? String(role).trim() : 'Pilot Evaluator',
        interest_area: interest_area || 'Full Multi-Agent Pipeline',
        notes: notes ? String(notes).trim() : '',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('waitlist_signups')
        .insert(newSignup)
        .select()
        .single();

      if (error) {
        // If unique constraint or duplicate
        if (error.code === '23505') {
          return res.status(200).json({ message: 'You are already registered on the waitlist! We will be in touch soon.' });
        }
        throw error;
      }

      return res.status(201).json({ message: 'Thank you for joining the LifeLine Agent pilot waitlist!', data });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Waitlist API error:', err);
    res.status(500).json({ error: err.message });
  }
}
