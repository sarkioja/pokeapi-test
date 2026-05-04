# pokeapi-test

API REST construída como prova de conceito de Clean/Hexagonal Architecture em NestJS com TypeScript. O domínio de Pokémon é um pretexto: o objetivo real é demonstrar como organizar uma aplicação backend onde regras de negócio, infraestrutura e integrações externas ficam isoladas entre si e podem evoluir de forma independente.

A API gerencia treinadores, seus times e os pokémon que os compõem. Duas integrações externas entram nessa equação com propósitos distintos.

A [PokéAPI](https://pokeapi.co) é uma API pública com dados de toda a franquia Pokémon. Aqui ela serve de fonte para buscar e armazenar dados de pokémon sob demanda, com cache local no PostgreSQL e TTL configurável. Quando a PokéAPI está indisponível, o sistema entrega os dados em cache com uma advertência em vez de falhar a requisição.

O [ViaCEP](https://viacep.com.br) é um serviço gratuito de consulta de CEPs brasileiros. Ao cadastrar um CEP, o perfil do treinador é enriquecido com o endereço completo buscado na hora. É uma integração mais simples, mas mostra como tratar uma dependência externa com validação no domínio e tratamento de erros próprio.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | NestJS 10 + TypeScript |
| ORM / DB | TypeORM 0.3 + PostgreSQL 16 |
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
# API_KEYS aceita qualquer valor em desenvolvimento; veja docs/security.md para requisitos de produção
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
| `API_KEYS` | **obrigatório** | Chaves de acesso separadas por vírgula — mínimo 32 chars por chave em produção (ver [docs/security.md](docs/security.md)) |
| `POKEAPI_BASE_URL` | `https://pokeapi.co/api/v2` | Base URL da PokéAPI |
| `POKEMON_TTL_HOURS` | `24` | TTL do cache de pokémon (horas) |
| `POKEMON_TYPE_TTL_DAYS` | `7` | TTL do cache de tipos (dias) |
| `HTTP_TIMEOUT_MS` | `5000` | Timeout para requisições externas |
| `VIACEP_BASE_URL` | `https://viacep.com.br/ws` | Base URL do ViaCEP |
| `CORS_ORIGINS` | `http://localhost:3000` | Origens CORS permitidas |

> A aplicação **não sobe** se `API_KEYS` estiver vazio. Em `production`, chaves com menos de 32 caracteres também são rejeitadas.

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

- **Swagger UI**: https://pokeapi-test-dev.onrender.com/api
- **Chave de API**: utilize a `API_KEY` `139191c29c26cbe7babf3d27b96a4734f8ae89da3de79b7f67017617556771cf` - Válida pelas próximas 24 horas
- **Bruno collection**: pasta `.bruno/` — importe no [Bruno](https://www.usebruno.com/); a chave de acesso local está no `.env` gerado a partir do `.env.example`
- **Local**: `http://localhost:3000/api`
