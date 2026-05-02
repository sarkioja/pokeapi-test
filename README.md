# pokeapi-test

REST API para gerenciar Treinadores, Times e Pokémon — desafio técnico para Sênior Backend Developer.

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

## Endpoints `/api/v1`

Todas as rotas exigem o header `X-API-Key: <chave>` — exceto `GET /api/health`.

### Trainers

| Método | Rota | Status |
|--------|------|--------|
| `POST` | `/trainers` | 201, 400, 409 |
| `GET` | `/trainers?limit&offset` | 200 |
| `GET` | `/trainers/:id` | 200, 404 |
| `PATCH` | `/trainers/:id` | 200, 400, 404 |
| `PATCH` | `/trainers/:id/cep` | 200, 400, 404 |
| `DELETE` | `/trainers/:id` | 204, 404 |
| `PATCH` | `/trainers/:id/restore` | 200, 404, 409 |

### Teams

| Método | Rota | Status |
|--------|------|--------|
| `POST` | `/teams` | 201, 400, 404 |
| `GET` | `/trainers/:trainerId/teams?limit&offset` | 200, 404 |
| `GET` | `/teams/:id` | 200, 404 |
| `PATCH` | `/teams/:id` | 200, 400, 404 |
| `DELETE` | `/teams/:id` | 204, 404 |
| `POST` | `/teams/:id/pokemon` | 201, 400, 404, 409, 422 |
| `DELETE` | `/teams/:teamId/pokemon/:slotId` | 204, 404 |
| `GET` | `/teams/:id/analysis` | 200, 404 |

### Pokémon

| Método | Rota | Status |
|--------|------|--------|
| `GET` | `/pokemon?limit&offset` | 200 |
| `GET` | `/pokemon/:nameOrId` | 200, 404 |

### Health

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Status do banco (público, sem API Key) |

---

## Regras de Negócio

- **Máximo 5 pokémon por time** → 422 `TEAM_FULL`
- **Sem duplicatas no time** → 409 `DUPLICATE_POKEMON`
- **Time arquivado não aceita pokémon** → 422 `TEAM_ARCHIVED`
- **Soft delete de Trainer** cascateia para seus times (transação)
- **Cache de Pokémon** → TTL configurável via `POKEMON_TTL_HOURS`; se a PokéAPI estiver indisponível e houver dado local, retorna o dado stale com warning no log
- **CEP** → validado por regex; ViaCEP consultado para enriquecer endereço; `{ erro: true }` no body vira 404

---

## Arquitetura

```
src/
├── domain/          # Entidades, ports, exceções — sem dependências de framework
├── application/     # Use cases — orquestram domínio e ports
├── infrastructure/  # TypeORM, HTTP clients (PokéAPI, ViaCEP), config
└── presentation/    # Controllers, DTOs, guards, filters
```

### Integrações Externas

| Serviço | Uso |
|---------|-----|
| **PokéAPI** `/pokemon/:name` | Busca e cache de pokémon |
| **PokéAPI** `/type/:name` | Cache de efetividade de tipos para `/analysis` |
| **ViaCEP** | Enriquecimento de endereço por CEP |

### Banco de Dados

- `synchronize: false` em todos os ambientes — somente migrations
- Soft delete (`deleted_at`) em Trainers e Teams
- Índice único parcial em `trainers(email) WHERE deleted_at IS NULL` — permite restore sem conflito de email
- `UNIQUE(team_id, pokemon_id)` em `team_pokemon`

---

## Testes

```bash
# Unitários (sem banco)
npm run test:unit

# Integração (banco real — schema 'test' isolado)
npm run test:integration

# E2E (AppModule completo — schema 'test' isolado)
npm run test:e2e
```

Os testes de integração e E2E usam o schema PostgreSQL `test` dentro do banco `pokeapi_dev`.  
O `globalSetup` recria o schema e aplica migrations antes de cada run — **dados em `public.*` nunca são afetados**.

### Cobertura atual

| Suite | Testes |
|-------|--------|
| Unit | 28 |
| Integration | 13 |
| E2E | 33 |
| **Total** | **74** |

---

## Migrations

```bash
# Gerar nova migration a partir das entidades
npm run migration:generate -- src/infrastructure/database/typeorm/migrations/NomeDaMigration

# Aplicar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert
```

---

## Segurança

- `X-API-Key` obrigatório em todas as rotas (exceto `/api/health` e `/api` Swagger)
- `@nestjs/throttler` — 100 req/min por IP
- `helmet` — headers de segurança HTTP
- CORS configurável via `CORS_ORIGINS`

---

## Acesso à API de teste

> **Em breve** — links e chaves de acesso ao ambiente `develop` serão adicionados após o deploy no Render + Neon.

Para explorar os endpoints localmente, use o Swagger UI em `http://localhost:3000/api` ou a coleção Bruno em `.bruno/`.
