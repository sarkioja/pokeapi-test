# Segurança

## Autenticação — API Key

- Header `X-API-Key: <chave>` obrigatório em todas as rotas, exceto `GET /api/health` e `GET /api` (Swagger)
- Chaves configuradas via variável de ambiente `API_KEYS` (separadas por vírgula)
- A aplicação **não sobe** se `API_KEYS` estiver vazio — validado no `ApiKeyGuard` na inicialização
- Em produção as chaves são definidas manualmente no dashboard do Render (`sync: false` no `render.yaml`)

### Formato e requisitos das chaves

| Ambiente | Comprimento mínimo | Exemplo |
|----------|--------------------|---------|
| `development` | qualquer | `my-dev-key` |
| `test` | qualquer | `e2e-test-key` |
| `production` | **32 caracteres** | `a3f9c2e1b8d4...` |

A aplicação **rejeita o boot em produção** se qualquer chave tiver menos de 32 caracteres.

**Chaves que não são mais aceitas em produção:**

```
# Muito curtas — rejeitadas com NODE_ENV=production
API_KEYS=dev-key-local
API_KEYS=change-me
API_KEYS=minha-chave-dev
```

**Formato recomendado:**

```bash
# Gerar uma chave segura (32 bytes = 64 hex chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
# .env em produção — cada chave com 32+ caracteres
API_KEYS=a3f9c2e1b8d47f6c9e0a12b34c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d
```

Múltiplas chaves (para clientes distintos):

```
API_KEYS=a3f9c2e1b8d47f6c9e0a12b34c5d6e7f8a9b0c1d,b7e2a9f3c1d05e8b4f6a2c9d0e1f3b5c7d9a0b2
```

### Distribuição segura por ambiente

| Ambiente | Onde definir | Observação |
|----------|-------------|-----------|
| Local | `.env` (não commitado) | Use qualquer valor para desenvolvimento |
| CI (GitHub Actions) | Secret do repositório `API_KEYS` | Valor curto é aceito — usado apenas em testes |
| Dev (Render) | Dashboard → Environment Variables, `sync: false` | Chave real, nunca em código |
| Prod (Render) | Dashboard → Environment Variables, `sync: false` | Mínimo 32 chars, gerada com `crypto.randomBytes` |

### Evolução planejada

A abordagem atual (env var) é adequada para o escopo do projeto. Para escalar com múltiplos clientes, o próximo passo seria uma tabela `api_keys` com SHA-256 hash, cache em memória com TTL, e endpoints de gerenciamento — eliminando a necessidade de redeploy para rotação de chaves.

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
