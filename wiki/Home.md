# pokeapi-test

A REST API built as a proof of concept for Clean/Hexagonal Architecture in NestJS with TypeScript. The Pokémon domain is a pretext — the real goal is to demonstrate how to structure a backend application where business rules, infrastructure, and external integrations are isolated from each other and can evolve independently.

The API manages trainers, their teams, and the Pokémon that make them up. Two external integrations are involved, each with a distinct purpose.

[PokéAPI](https://pokeapi.co) is a public API with data from the entire Pokémon franchise. Here it serves as a source to fetch and store Pokémon data on demand, with local caching in PostgreSQL and a configurable TTL. When PokéAPI is unavailable, the system delivers cached data with a warning instead of failing the request.

[ViaCEP](https://viacep.com.br) is a free Brazilian ZIP code lookup service. When a ZIP code (CEP) is registered, the trainer's profile is enriched with the full address fetched at that moment. It's a simpler integration, but demonstrates how to handle an external dependency with domain validation and proper error handling.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 10 + TypeScript |
| ORM / DB | TypeORM 0.3 + PostgreSQL 16 |
| Validation | class-validator + class-transformer |
| Docs | @nestjs/swagger (OpenAPI 3.0) |
| Tests | Jest — unit / integration / E2E |
| Local infra | Docker Compose |

---

## Getting Started

### Prerequisites
- Node.js 20+
- Docker + Docker Compose

### 1. Clone and install dependencies

```bash
git clone https://github.com/sarkioja/pokeapi-test.git
cd pokeapi-test
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
# API_KEYS accepts any value in development; see Security for production requirements
```

### 3. Start the database

```bash
docker compose up -d
```

### 4. Run migrations

```bash
npm run migration:run
```

### 5. Start the application

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.  
Swagger UI: `http://localhost:3000/api`

> **Cold start**: the first request that fetches a Pokémon from PokéAPI may take up to 5s.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Environment |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | `postgres` | Username |
| `DB_PASSWORD` | `postgres` | Password |
| `DB_NAME` | `pokeapi_dev` | Database name |
| `DATABASE_URL` | — | Neon connection string (replaces above vars in production) |
| `API_KEYS` | **required** | Comma-separated access keys — minimum 32 chars per key in production (see [[Security]]) |
| `POKEAPI_BASE_URL` | `https://pokeapi.co/api/v2` | PokéAPI base URL |
| `POKEMON_TTL_HOURS` | `24` | Pokémon cache TTL (hours) |
| `POKEMON_TYPE_TTL_DAYS` | `7` | Type cache TTL (days) |
| `HTTP_TIMEOUT_MS` | `5000` | Timeout for external requests |
| `VIACEP_BASE_URL` | `https://viacep.com.br/ws` | ViaCEP base URL |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed CORS origins |

> The application **will not start** if `API_KEYS` is empty. In `production`, keys shorter than 32 characters are also rejected.

---

## Test API Access

- **Swagger UI**: https://pokeapi-test-dev.onrender.com/api
- **API Key**: use the provided `API_KEY`
- **Bruno collection**: `.bruno/` folder — import into [Bruno](https://www.usebruno.com/); the local access key is in the `.env` generated from `.env.example`
- **Local**: `http://localhost:3000/api`

---

## Wiki Pages

| Page | Description |
|------|-------------|
| [[Architecture]] | Clean/Hexagonal Architecture, folder structure, cache strategy, and library decisions |
| [[API-Endpoints]] | Complete endpoint reference with examples |
| [[Business-Rules]] | Business logic, soft delete, cascade restore, error hierarchy |
| [[Database-ERD]] | Entity Relationship Diagram and modeling decisions |
| [[Testing]] | Test suites, isolation strategy, and full test specs |
| [[Security]] | API Key auth, rate limiting, CORS, and Swagger |
| [[Migrations]] | Migration commands, deploy flow, and special indices |
| [[Git-Conventions]] | Conventional Commits, branching strategy, and Husky hooks |
