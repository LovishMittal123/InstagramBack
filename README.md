# BackendInsta — Deployment

Quick notes to deploy this Node.js/Express app.

Docker (recommended):

Build image:

```bash
docker build -t backendinsta:latest .
```

Run container (set env vars appropriately):

```bash
docker run -p 5000:5000 -e CONNECTION_KEY="your_mongo_uri" -e NODE_ENV=production backendinsta:latest
```

Heroku (optional):

1. Commit and push to a GitHub repo.
2. Connect the repo to Heroku or push via Git.
3. Set config vars on Heroku: `CONNECTION_KEY`, other secrets.

Notes:
- The app reads `PORT` from `process.env.PORT`.
- Do NOT commit `.env` — use platform config vars.

Render (recommended, simple):

1. Push this repository to GitHub (or connect your Git provider) and link it in Render.
2. In Render, create a new **Web Service** and choose to deploy from the repo; this `render.yaml` will auto-configure a Docker-based service.
3. Set the following environment variables in Render (do NOT commit values):
	- `CONNECTION_KEY` (your MongoDB connection URI)
	- `COOKIE_SECRET` (any cookie signing secret)
	- `NODE_ENV` = `production` (optional)
4. Deploy — Render will build using the `Dockerfile` and start the app; Render sets `PORT` automatically.

Quick Git commands:

```bash
git add .
git commit -m "Add Render manifest and deployment docs"
git push origin main
```

