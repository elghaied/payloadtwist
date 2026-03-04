# Deployment: GitHub Actions + GHCR + Coolify

Build a Docker image on tag push, publish to GitHub Container Registry, deploy on Coolify.

---

## 1. GitHub Actions Workflows

### CI (`.github/workflows/ci.yml`)

Runs on every push to `main` and on pull requests:
- `pnpm typecheck`
- `pnpm lint`
- `pnpm build`
- Integration tests (with PostgreSQL service)

### Docker Publish (`.github/workflows/docker-publish.yml`)

Triggers on version tags (`v*`). Builds the Docker image with BuildKit mount secrets and pushes to GHCR.

No extra GitHub secrets are needed — the built-in `GITHUB_TOKEN` handles GHCR auth.

**Tagging a release:**

```bash
git tag v1.0.0
git push origin v1.0.0
```

This produces:
- `ghcr.io/elghaied/payloadtwist:1.0.0`
- `ghcr.io/elghaied/payloadtwist:1.0`
- `ghcr.io/elghaied/payloadtwist:latest`

### Build secrets

The Dockerfile uses BuildKit `--mount=type=secret` for build-time secrets (`AUTH_DATABASE_URL`, `BETTER_AUTH_SECRET`). These are dummy placeholder values needed only for Next.js compilation — real values are provided at runtime via environment variables.

The CI workflow passes these inline. For local builds:

```bash
echo "postgresql://localhost:5432/placeholder" > /tmp/AUTH_DATABASE_URL
echo "build-time-secret-placeholder-minimum-32chars" > /tmp/BETTER_AUTH_SECRET
docker build \
  --secret id=AUTH_DATABASE_URL,src=/tmp/AUTH_DATABASE_URL \
  --secret id=BETTER_AUTH_SECRET,src=/tmp/BETTER_AUTH_SECRET \
  -f apps/web/Dockerfile .
rm /tmp/AUTH_DATABASE_URL /tmp/BETTER_AUTH_SECRET
```

For `docker compose build`, set `AUTH_DATABASE_URL_BUILD` and `BETTER_AUTH_SECRET_BUILD` environment variables (any dummy value works).

### Make the package public (first time only)

After the first push, the image defaults to private:

```bash
gh api -X PUT /user/packages/container/payloadtwist/visibility -f visibility=public
```

Or go to **github.com > Your profile > Packages > payloadtwist > Package settings > Change visibility > Public**.

---

## 2. Coolify Setup

### Resource type

Add a new resource: **Docker Image** (not Docker Compose, not Nixpacks).

### Image

```
ghcr.io/elghaied/payloadtwist:latest
```

### Database

Create a **PostgreSQL** resource in Coolify first. Coolify gives you the internal connection string:

```
postgresql://postgres:<password>@<coolify-pg-host>:5432/payloadtwist_auth
```

### Environment Variables

Set these in the Coolify resource's **Environment Variables** section:

| Variable | Value | Required |
|----------|-------|----------|
| `AUTH_DATABASE_URL` | `postgresql://postgres:<pw>@<pg-host>:5432/payloadtwist_auth` | Yes |
| `BETTER_AUTH_SECRET` | Random 32+ char string (`openssl rand -base64 32`) | Yes |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.com` | Yes |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth app ID | Optional |
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth app secret | Optional |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret | Optional |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | Optional |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key | Optional |

### Coolify settings

- **Port**: `3000`
- **Health check path**: `/api/health`
- **Domain**: Set your domain in Coolify's proxy settings — it handles SSL via Traefik/Caddy automatically

### Auto-deploy on new tags

In Coolify, enable **Webhooks** or **Polling** to redeploy when the `:latest` tag updates. Alternatively, add a webhook step to the GitHub Actions workflow:

```yaml
      - name: Trigger Coolify deploy
        run: |
          curl -s "${{ secrets.COOLIFY_WEBHOOK_URL }}" || true
```

If using this, add one GitHub secret:

| Secret | Value |
|--------|-------|
| `COOLIFY_WEBHOOK_URL` | The webhook URL from Coolify's deployment settings |

---

## 3. Database Migrations

The Docker image includes Drizzle migrations at `/app/drizzle/`. Better Auth auto-creates its tables on first connection — you typically don't need manual migrations.

---

## Quick Checklist

1. [ ] Push to main, verify CI passes
2. [ ] Tag a release: `git tag v1.0.0 && git push origin v1.0.0`
3. [ ] First build runs — image lands in GHCR
4. [ ] Make GHCR package public (one time)
5. [ ] Create PostgreSQL in Coolify
6. [ ] Create Docker Image resource pointing to `ghcr.io/elghaied/payloadtwist:latest`
7. [ ] Set environment variables (table above)
8. [ ] Set port to `3000`, domain, and health check
9. [ ] Deploy — verify at `https://your-domain.com`
10. [ ] (Optional) Set up webhook for auto-deploy
