Implemented pull-based production deploy via GitHub Container Registry (GHCR), removing need to build image on server each update.

Added:
- .github/workflows/docker-publish.yml
  - builds Docker image on push to main
  - pushes to ghcr.io/makmillerme/komerciya_mtruck_next
  - tags: latest + short sha
- docker-compose.server.yml
  - uses image ghcr.io/makmillerme/komerciya_mtruck_next:latest
  - pull_policy: always
  - keeps same volumes/env including INTERNAL_RENDER_URL
- SERVER_DEPLOY_GHCR.md
  - step-by-step server commands for pull-only deploy/update
- DEPLOY_DOCKER.md updated with GHCR alternative.

Git:
- Commit: ea9a26d
- Pushed to origin/main