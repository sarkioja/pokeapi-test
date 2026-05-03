# pokeapi-test

REST API para gerenciar Treinadores, Times e Pokémon.

Construído com **NestJS · TypeORM · PostgreSQL** seguindo Clean/Hexagonal Architecture.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | NestJS 10 + TypeScript |
| ORM / DB | TypeORM 0.3 + PostgreSQL 15 |
| Validação | class-validator + class-transformer |
| Docs | @nestjs/swagger (OpenAPI 3.0) |
| Testes | Jest — unit / integration / E2E |
| Infra local | Docker Compose |

---

## Rodando localmente

### Pré-requisitos
- Node.js 20+
- Docker + Docker Compose

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/sarkioja/pokeapi-test.git
cd pokeapi-test
npm install
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
# Edite API_KEYS com pelo menos uma chave (ex: minha-chave-dev)
```

### 3. Subir o banco de dados

```bash
docker compose up -d
```

### 4. Aplicar migrations

```bash
npm run migration:run
```

### 5. Iniciar a aplicação

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.
Swagger UI: `http://localhost:3000/api`

> **Cold start**: na primeira requisição que busca um Pokémon da PokéAPI pode levar até 5s.

---

## Variáveis de Ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta HTTP |
| `NODE_ENV` | `development` | Ambiente |
| `DB_HOST` | `localhost` | Host PostgreSQL |
| `DB_PORT` | `5432` | Porta PostgreSQL |
| `DB_USERNAME` | `postgres` | Usuário |
| `DB_PASSWORD` | `postgres` | Senha |
| `DB_NAME` | `pokeapi_dev` | Nome do banco |
| `DATABASE_URL` | — | Connection string Neon (substitui as vars acima em produção) |
| `API_KEYS` | **obrigatório** | Chaves de acesso separadas por vírgula |
| `POKEAPI_BASE_URL` | `https://pokeapi.co/api/v2` | Base URL da PokéAPI |
| `POKEMON_TTL_HOURS` | `24` | TTL do cache de pokémon (horas) |
| `POKEMON_TYPE_TTL_DAYS` | `7` | TTL do cache de tipos (dias) |
| `HTTP_TIMEOUT_MS` | `5000` | Timeout para requisições externas |
| `VIACEP_BASE_URL` | `https://viacep.com.br/ws` | Base URL do ViaCEP |
| `CORS_ORIGINS` | `http://localhost:3000` | Origens CORS permitidas |

> A aplicação **não sobe** se `API_KEYS` estiver vazio.

---

## Diagramas

ERD (modelo de banco) e diagramas de arquitetura em camadas, sequências e fluxo de cache:

→ [docs/erd.md](docs/erd.md)
→ [docs/architecture.md](docs/architecture.md)

---

## Endpoints

Trainers · Teams · Pokémon · Health — tabelas completas com métodos, rotas e status codes:

→ [docs/endpoints.md](docs/endpoints.md)

---

## Regras de Negócio

Limite de pokémon por time, soft delete de treinador, cache PokéAPI com fallback resiliente, integração ViaCEP e hierarquia de erros de domínio:

→ [docs/business-rules.md](docs/business-rules.md)

---

## Arquitetura

Clean/Hexagonal Architecture, estrutura de pastas, integrações externas e decisões de modelagem:

→ [docs/architecture.md](docs/architecture.md)

---

## Convenções Git

Conventional Commits, Trunk-Based Development adaptado e hooks Husky (pre-commit: lint + typecheck, pre-push: unit tests):

→ [docs/git-conventions.md](docs/git-conventions.md)

---

## Testes

Comandos, isolamento via schema PostgreSQL `test`, cobertura atual (74 testes):

→ [docs/testing.md](docs/testing.md)

---

## Migrations

Comandos de geração, aplicação e reversão; índices especiais; fluxo de deploy:

→ [docs/migrations.md](docs/migrations.md)

---

## Segurança

API Key, rate limiting, helmet, CORS e Swagger UI:

→ [docs/security.md](docs/security.md)

---

## Acesso à API de teste

- **Swagger UI (develop)**: `<URL_RENDER_DEV>/api`
- **Chave de API**: configurada via `API_KEYS` no dashboard do Render
- **Bruno collection**: pasta `.bruno/` — importe no [Bruno](https://www.usebruno.com/)
- **Local**: `http://localhost:3000/api` com key `change-me-dev-key-1`
