import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Endpoint to handle GitHub Push via Token
app.post('/api/github-push', (req, res) => {
  const token = req.body?.token || process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(400).json({ success: false, error: 'GitHub Personal Access Token is required to push to repository.' });
  }
  const username = 'hardhustlekd-max';
  const repo = 'keyboard';
  const remoteUrl = `https://x-access-token:${token}@github.com/${username}/${repo}.git`;

  const commands = [
    'git init',
    'git config user.name "hardhustlekd-max"',
    'git config user.email "kirubeldenekew14@gmail.com"',
    'git add .',
    'git commit -m "Update: Amharic Android Keyboard App (Android 2.4+ supported) with Clean Minimalism theme and Windows 10 Amharic Phonetic engine" || true',
    'git branch -M main',
    `git remote set-url origin "${remoteUrl}" 2>/dev/null || git remote add origin "${remoteUrl}"`,
    'git push -f origin main'
  ].join(' && ');

  exec(commands, { cwd: process.cwd() }, (error, stdout, stderr) => {
    let cleanErr = (stderr || error?.message || '').replace(new RegExp(token, 'g'), '***TOKEN***');
    if (error) {
      console.error('Git push error:', cleanErr);
      return res.status(500).json({ success: false, error: cleanErr || 'Failed to push to remote repository' });
    }
    console.log('Git push success:', stdout);
    return res.json({ success: true, message: 'Successfully pushed to GitHub repository hardhustlekd-max/keyboard', stdout });
  });
});

async function startServer() {
  // Serve www landing page directory
  app.use('/www', express.static(path.join(process.cwd(), 'www')));

  // Mount Vite middleware in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
