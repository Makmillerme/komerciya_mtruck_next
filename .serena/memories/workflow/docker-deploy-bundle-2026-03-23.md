Prepared Docker deployment bundle for komerciya_mtruck_next and pushed to GitHub main.

Added files:
- Dockerfile (multi-stage, Playwright image, Next.js production run)
- docker-compose.yml (service app, port 3000, persistent data volumes)
- .dockerignore
- deploy.bat (build + up)
- update-and-deploy.bat (git pull + rebuild + restart)
- stop.bat (compose down)
- DEPLOY_DOCKER.md (server setup and run instructions)

Git:
- Commit: acfd5a1
- Pushed to: origin/main
- Repo: https://github.com/Makmillerme/komerciya_mtruck_next