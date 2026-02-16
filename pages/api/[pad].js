import fs from 'fs';
import path from 'path';

const padsDir = path.join(process.cwd(), 'public', 'pads');

// Ensure pads directory exists
if (!fs.existsSync(padsDir)) {
  fs.mkdirSync(padsDir, { recursive: true });
}

export default function handler(req, res) {
  const { pad } = req.query;

  if (!pad) {
    return res.status(400).json({ error: 'Pad name is required' });
  }

  const filePath = path.join(padsDir, `${pad}.json`);

  if (req.method === 'GET') {
    // Get or create pad
    const defaultContent = {
      text: '',
      title: pad,
      subpads: [],
      author: null,
      lastIp: null,
      updatedAt: new Date().toISOString()
    };

    try {
      const file = fs.readFileSync(filePath, 'utf8');
      return res.status(200).json(JSON.parse(file));
    } catch (e) {
      // File doesn't exist, create it
      fs.writeFileSync(filePath, JSON.stringify(defaultContent));
      return res.status(200).json(defaultContent);
    }
  } else if (req.method === 'PUT') {
    // Update/create pad
    try {
      const content = req.body;
      fs.writeFileSync(filePath, JSON.stringify(content));
      return res.status(200).json(content);
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save pad' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
