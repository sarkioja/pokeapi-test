# Endpoints `/api/v1`

Todas as rotas exigem o header `X-API-Key: <chave>` — exceto `GET /api/health` e `GET /api` (Swagger).

Explore interativamente via **Swagger UI**: `http://localhost:3000/api`

---

## Trainers

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| `POST` | `/api/v1/trainers` | Criar treinador | 201, 400, 409 |
| `GET` | `/api/v1/trainers?limit&offset` | Listar (paginado) | 200 |
| `GET` | `/api/v1/trainers/:id` | Buscar por ID | 200, 404 |
| `PATCH` | `/api/v1/trainers/:id` | Atualizar nome ou e-mail | 200, 400, 404 |
| `PATCH` | `/api/v1/trainers/:id/cep` | Enriquecer endereço via ViaCEP | 200, 400, 404 |
| `DELETE` | `/api/v1/trainers/:id` | Soft delete (+ soft-deleta times) | 204, 404 |
| `PATCH` | `/api/v1/trainers/:id/restore` | Reativar treinador | 200, 404, 409 |

---

## Teams

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| `POST` | `/api/v1/teams` | Criar time | 201, 400, 404 |
| `GET` | `/api/v1/trainers/:trainerId/teams?limit&offset` | Listar times de um treinador | 200, 404 |
| `GET` | `/api/v1/teams/:id` | Buscar time com pokémons | 200, 404 |
| `PATCH` | `/api/v1/teams/:id` | Atualizar nome ou status | 200, 400, 404 |
| `DELETE` | `/api/v1/teams/:id` | Soft delete | 204, 404 |
| `POST` | `/api/v1/teams/:id/pokemon` | Adicionar pokémon ao time | 201, 400, 404, 409, 422 |
| `DELETE` | `/api/v1/teams/:teamId/pokemon/:slotId` | Remover pokémon do time | 204, 404 |
| `GET` | `/api/v1/teams/:id/analysis` | Análise de tipos (fraquezas/resistências) | 200, 404 |

---

## Pokémon

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| `GET` | `/api/v1/pokemon?limit&offset` | Listar pokémon no cache local (paginado) | 200 |
| `GET` | `/api/v1/pokemon/:nameOrId` | Buscar/fetch por nome ou pokeapi_id | 200, 404 |

---

## Health

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Status do banco via @nestjs/terminus (público, sem API Key) |

---

## Fluxo completo — exemplo ponta a ponta

Todos os exemplos usam `http://localhost:3000` e o header `X-API-Key: minha-chave`.

---

### 1. Criar treinador

```http
POST /api/v1/trainers
Content-Type: application/json
X-API-Key: minha-chave

{
  "name": "Ash Ketchum",
  "email": "ash@pokemon.com"
}
```

```json
// 201 Created
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Ash Ketchum",
  "email": "ash@pokemon.com",
  "cep": null,
  "addressStreet": null,
  "addressCity": null,
  "addressState": null,
  "createdAt": "2026-05-03T14:00:00.000Z"
}
```

Guarde o `id` retornado — ele será usado em todas as etapas seguintes.

---

### 2. Enriquecer endereço via CEP

```http
PATCH /api/v1/trainers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/cep
Content-Type: application/json
X-API-Key: minha-chave

{
  "cep": "01310100"
}
```

```json
// 200 OK
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "cep": "01310100",
  "addressStreet": "Avenida Paulista",
  "addressNeighborhood": "Bela Vista",
  "addressCity": "São Paulo",
  "addressState": "SP",
  "addressCountry": "BR"
}
```

O ViaCEP é consultado internamente — o cliente envia apenas o CEP.

---

### 3. Buscar treinador por ID

```http
GET /api/v1/trainers/a1b2c3d4-e5f6-7890-abcd-ef1234567890
X-API-Key: minha-chave
```

```json
// 200 OK
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Ash Ketchum",
  "email": "ash@pokemon.com",
  "cep": "01310100",
  "addressStreet": "Avenida Paulista",
  "addressNeighborhood": "Bela Vista",
  "addressCity": "São Paulo",
  "addressState": "SP",
  "addressCountry": "BR"
}
```

---

### 4. Criar time

```http
POST /api/v1/teams
Content-Type: application/json
X-API-Key: minha-chave

{
  "name": "Time Kanto",
  "trainerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

```json
// 201 Created
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "Time Kanto",
  "status": "active",
  "trainerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2026-05-03T14:05:00.000Z"
}
```

---

### 5. Adicionar pokémon ao time

O endpoint aceita o nome ou o ID numérico da PokéAPI. Na primeira chamada, o pokémon é buscado da PokéAPI e cacheado localmente — chamadas seguintes usam o cache.

```http
POST /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901/pokemon
Content-Type: application/json
X-API-Key: minha-chave

{ "pokemonName": "pikachu" }
```

```json
// 201 Created
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "slot": 1,
  "pokemon": { "id": "...", "name": "pikachu", "types": ["electric"] },
  "nickname": null
}
```

Repita para os demais pokémon. O campo `pokemonName` aceita nome em minúsculas ou `pokemonId` (inteiro da PokéAPI):

```http
POST /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901/pokemon
{ "pokemonName": "charizard" }

POST /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901/pokemon
{ "pokemonName": "blastoise" }
```

Erros possíveis: `409` se o pokémon já está no time, `422` se o time está cheio (5 slots) ou arquivado.

---

### 6. Buscar time por ID

```http
GET /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901
X-API-Key: minha-chave
```

```json
// 200 OK
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "Time Kanto",
  "status": "active",
  "pokemon": [
    { "slot": 1, "pokemon": { "name": "pikachu",   "types": ["electric"] } },
    { "slot": 2, "pokemon": { "name": "charizard",  "types": ["fire", "flying"] } },
    { "slot": 3, "pokemon": { "name": "blastoise",  "types": ["water"] } }
  ]
}
```

---

### 7. Analisar tipos do time

```http
GET /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901/analysis
X-API-Key: minha-chave
```

```json
// 200 OK
{
  "teamId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "coverage": {
    "strongAgainst": ["grass", "bug", "ice", "steel", "rock"],
    "weakAgainst":   ["electric", "rock"],
    "immuneTo":      ["ground"]
  }
}
```

A análise é calculada a partir dos dados de efetividade de tipos cacheados em `POKEMON_TYPES` — sem chamada externa se o cache estiver válido.

---

### 8. Listar times do treinador

```http
GET /api/v1/trainers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/teams?limit=10&offset=0
X-API-Key: minha-chave
```

```json
// 200 OK
{
  "data": [
    { "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "name": "Time Kanto", "status": "active" }
  ],
  "total": 1
}
```
