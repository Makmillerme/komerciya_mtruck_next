# Deploy from GitHub Container Registry (No build on server)

## 1) One-time setup on server

1. Clone repo:
   - `git clone https://github.com/Makmillerme/komerciya_mtruck_next.git`
2. Go to project folder.
3. Create `.env` file:

```bash
cat > .env << 'EOF'
NEXT_PUBLIC_APP_URL=https://komerciyamtruck.duckdns.org
INTERNAL_RENDER_URL=http://127.0.0.1:3000
EOF
```

## 2) Run app from prebuilt image

```bash
cd ~/apps/komerciya-mtruck

docker compose -f docker-compose.server.yml pull
docker compose -f docker-compose.server.yml up -d
```

## 3) Regular updates (no local build)

```bash
cd ~/apps/komerciya-mtruck

git pull
docker compose -f docker-compose.server.yml pull
docker compose -f docker-compose.server.yml up -d
```

## Notes

- Image is published by GitHub Actions on every push to `main`.
- Published image:
  - `ghcr.io/makmillerme/komerciya_mtruck_next:latest`
- If GHCR package is private, run `docker login ghcr.io` with a token that has `read:packages`.
