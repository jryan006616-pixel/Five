import { put, head } from '@vercel/blob';

// Single, fixed pathname for the whole portal's live dataset.
const BLOB_PATHNAME = 'rhinomds-portal-data.json';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      try {
        const meta = await head(BLOB_PATHNAME);
        const response = await fetch(meta.url, { cache: 'no-store' });
        if (!response.ok) {
          res.status(200).json(null);
          return;
        }
        const data = await response.json();
        res.status(200).json(data);
        return;
      } catch (e) {
        // No blob saved yet
        res.status(200).json(null);
        return;
      }
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        body = JSON.parse(body);
      }
      if (!body || typeof body !== 'object') {
        res.status(400).json({ error: 'Invalid payload' });
        return;
      }

      await put(BLOB_PATHNAME, JSON.stringify(body), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
      });

      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Internal error' });
  }
}
