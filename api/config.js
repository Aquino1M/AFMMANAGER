// api/config.js — Endpoint Serverless Vercel para carregar chaves do Supabase
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

  return res.status(200).json({
    ok: true,
    url: String(url || '').trim(),
    key: String(key || '').trim()
  });
};
