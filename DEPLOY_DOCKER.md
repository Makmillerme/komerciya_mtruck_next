# Docker deploy (2-click flow)

## What is prepared

- `Dockerfile` - production image for Next.js + Playwright (Chromium included).
- `docker-compose.yml` - app service with persistent volumes.
- `deploy.bat` - build and run project.
- `update-and-deploy.bat` - pull latest git changes, rebuild, restart.
- `stop.bat` - stop containers.

## First deploy on server

1. Install Docker Desktop (Windows) or Docker Engine + Docker Compose plugin (Linux).
2. Clone repository:
   - `git clone https://github.com/Makmillerme/komerciya_mtruck_next.git`
3. Open project folder.
4. Run `deploy.bat` (double click in Windows).
5. Open: `http://localhost:3000`

## Regular updates

- Run `update-and-deploy.bat` (double click):
  - pulls latest code,
  - rebuilds image,
  - restarts container.

## Data persistence

Runtime data is stored in `data/` folder and survives container recreation:

- `data/uploads`
- `data/output`
- `data/proposal-print-temp`

## Optional environment override

You can set custom public URL before deploy:

- Windows PowerShell: `$env:NEXT_PUBLIC_APP_URL = "https://your-domain.com"`
- then run deploy script.
