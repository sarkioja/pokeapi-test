# Segurança

## Autenticação — API Key

- Header `X-API-Key: <chave>` obrigatório em todas as rotas, exceto `GET /api/health` e `GET /api` (Swagger)
- Chaves configuradas via variável de ambiente `API_KEYS` (separadas por vírgula)
- A aplicação **não sobe** se `API_KEYS` estiver vazio — validado no `ApiKeyGuard` na inicialização
- Em produção as chaves são definidas manualmente no dashboard do Render (`sync: false` no `render.yaml`)

---

## Rate Limiting

- `@nestjs/throttler` — 100 requisições por minuto por IP
- Trust proxy habilitado para respeitar `X-Forwarded-For` (Render usa load balancer)

---

## Headers HTTP

- `helmet` — aplica headers de segurança: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.

---

## CORS

- Origens permitidas configuradas via `CORS_ORIGINS` (variável de ambiente, separadas por vírgula)
- Padrão local: `http://localhost:3000`
- Em produção: definir explicitamente as origens do frontend

---

## Swagger UI

- Disponível em `GET /api` (JSON spec em `GET /api-json`)
- Público no ambiente develop para facilitar exploração
- Em produção, considerar proteção adicional (HTTP Basic Auth ou remoção do módulo)
