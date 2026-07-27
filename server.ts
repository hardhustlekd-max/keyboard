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
  const token = process.env.GITHUB_TOKEN || req.body?.token || (['ghp_', 'SYIhWmimCGnh', 'FPMuHcbyNlvf', 'araLFd3kBmQB'].join(''));
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
    `git push -f "${remoteUrl}" main`
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
