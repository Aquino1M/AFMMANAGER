// api/restore-saves.js — Endpoint Serverless Vercel para recuperar saves diretamente do Supabase Cloud
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUser = req.query?.username || req.body?.username || '';
  const username = String(rawUser || '').trim().toLowerCase();
  if (!username) {
    return res.status(400).json({ ok: false, error: 'Nome de usuário não informado' });
  }

  const url = process.env.SUPABASE_URL ||
              process.env.NEXT_PUBLIC_SUPABASE_URL ||
              process.env.VITE_SUPABASE_URL ||
              'https://yulsnzvgxtwbazqvetpe.supabase.co';

  const key = process.env.SUPABASE_ANON_KEY ||
              process.env.SUPABASE_KEY ||
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
              process.env.VITE_SUPABASE_ANON_KEY ||
              process.env.SUPABASE_SERVICE_ROLE_KEY ||
              'sb_publishable_9pNIjnDvAGEiSkOgjUiObQ_FctpMwpe';

  try {
    const endpoint = `${url.replace(/\/+$/, '')}/rest/v1/afm_saves?username=ilike.${encodeURIComponent(username)}&select=*&order=slot.asc`;
    const resp = await fetch(endpoint, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return res.status(resp.status).json({ ok: false, error: errText });
    }

    const data = await resp.json();
    return res.status(200).json({ ok: true, username, saves: data || [] });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || 'Falha ao buscar saves no Supabase' });
  }
};
