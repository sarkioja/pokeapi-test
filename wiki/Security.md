# Security

## Authentication — API Key

- `X-API-Key: <key>` header required on all routes, except `GET /api/health` and `GET /api` (Swagger)
- Keys configured via `API_KEYS` environment variable (comma-separated)
- The application **will not start** if `API_KEYS` is empty — validated at startup
- In production, keys are manually set in the Render dashboard (`sync: false` in `render.yaml`)

### Why env var instead of a full key management system?

This project is a proof of concept. The primary goal is to demonstrate architecture, not to build authentication infrastructure. Using `API_KEYS` as an environment variable is deliberately simple: it works without an additional database, without management endpoints, and without operational complexity. Sufficient to protect the API while the focus is on other layers.

The trade-offs are known: rotating a key requires a redeploy, there is no per-client traceability, and minimum key length is the only quality barrier. These limitations are acceptable within this scope.

When the project evolves to multiple clients or requires rotation without downtime, the [Planned Evolution](#planned-evolution) section describes the natural next step.

### Key Format and Requirements

| Environment | Minimum length | Example |
|-------------|----------------|---------|
| `development` | any | `my-dev-key` |
| `test` | any | `e2e-test-key` |
| `production` | **32 characters** | `a3f9c2e1b8d4...` |

The application **rejects boot in production** if any key is shorter than 32 characters.

**Keys that are not accepted in production:**

```
# Too short — rejected with NODE_ENV=production
API_KEYS=dev-key-local
API_KEYS=change-me
API_KEYS=my-dev-key
```

**Recommended format:**

```bash
# Generate a secure key (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
# .env in production — each key with 32+ characters
API_KEYS=a3f9c2e1b8d47f6c9e0a12b34c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d
```

Multiple keys (for distinct clients):

```
API_KEYS=a3f9c2e1b8d47f6c9e0a12b34c5d6e7f8a9b0c1d,b7e2a9f3c1d05e8b4f6a2c9d0e1f3b5c7d9a0b2
```

### Secure Distribution by Environment

| Environment | Where to define | Note |
|-------------|----------------|------|
| Local | `.env` (not committed) | Any value works for development |
| CI (GitHub Actions) | Repository secret `API_KEYS` | Short value is accepted — used only in tests |
| Dev (Render) | Dashboard → Environment Variables, `sync: false` | Real key, never in code |
| Prod (Render) | Dashboard → Environment Variables, `sync: false` | Minimum 32 chars, generated with `crypto.randomBytes` |

### Planned Evolution

When the simplicity of the env var is no longer sufficient, the natural next step is an `api_keys` table with SHA-256 hashing, in-memory cache with TTL, and management endpoints. This would eliminate redeploys for key rotation and allow per-client usage tracking — without changing the HTTP interface (the `X-API-Key` header remains the same).

---

## Rate Limiting

- `@nestjs/throttler` — 100 requests per minute per IP
- Trust proxy enabled to respect `X-Forwarded-For` (Render uses a load balancer)

---

## HTTP Headers

- `helmet` — applies security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.

---

## CORS

- Allowed origins configured via `CORS_ORIGINS` (environment variable, comma-separated)
- Local default: `http://localhost:3000`
- In production: explicitly define frontend origins

---

## Swagger UI

- Available at `GET /api` (JSON spec at `GET /api-json`)
- Public in the develop environment for easy exploration
- In production, consider additional protection (HTTP Basic Auth or removing the module)
