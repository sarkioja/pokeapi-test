# API Endpoints `/api/v1`

All routes require the `X-API-Key: <key>` header — except `GET /api/health` and `GET /api` (Swagger).

Explore interactively via **Swagger UI**: `http://localhost:3000/api`

---

## Trainers

| Method | Route | Description | Status |
|--------|-------|-------------|--------|
| `POST` | `/api/v1/trainers` | Create trainer | 201, 400, 409 |
| `GET` | `/api/v1/trainers?limit&offset` | List (paginated) | 200 |
| `GET` | `/api/v1/trainers/:id` | Get by ID | 200, 404 |
| `PATCH` | `/api/v1/trainers/:id` | Update name or email | 200, 400, 404 |
| `PATCH` | `/api/v1/trainers/:id/cep` | Enrich address via ViaCEP | 200, 400, 404 |
| `DELETE` | `/api/v1/trainers/:id` | Soft delete (+ soft-deletes teams) | 204, 404 |
| `PATCH` | `/api/v1/trainers/:id/restore` | Restore trainer | 200, 404, 409 |

---

## Teams

| Method | Route | Description | Status |
|--------|-------|-------------|--------|
| `POST` | `/api/v1/teams` | Create team | 201, 400, 404 |
| `GET` | `/api/v1/trainers/:trainerId/teams?limit&offset` | List teams for a trainer | 200, 404 |
| `GET` | `/api/v1/teams/:id` | Get team with Pokémon | 200, 404 |
| `PATCH` | `/api/v1/teams/:id` | Update name or status | 200, 400, 404 |
| `DELETE` | `/api/v1/teams/:id` | Soft delete | 204, 404 |
| `POST` | `/api/v1/teams/:id/pokemon` | Add Pokémon to team | 201, 400, 404, 409, 422 |
| `DELETE` | `/api/v1/teams/:teamId/pokemon/:slotId` | Remove Pokémon from team | 204, 404 |
| `GET` | `/api/v1/teams/:id/analysis` | Type analysis (weaknesses/resistances) | 200, 404 |

---

## Pokémon

| Method | Route | Description | Status |
|--------|-------|-------------|--------|
| `GET` | `/api/v1/pokemon?limit&offset` | List Pokémon in local cache (paginated) | 200 |
| `GET` | `/api/v1/pokemon/:nameOrId` | Fetch/get by name or pokeapi_id | 200, 404 |

---

## Health

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/health` | Database status via @nestjs/terminus (public, no API Key required) |

---

## End-to-End Flow — Example

All examples use `http://localhost:3000` and the header `X-API-Key: my-key`.

---

### 1. Create trainer

```http
POST /api/v1/trainers
Content-Type: application/json
X-API-Key: my-key

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

Save the returned `id` — it will be used in all subsequent steps.

---

### 2. Enrich address via ZIP code

```http
PATCH /api/v1/trainers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/cep
Content-Type: application/json
X-API-Key: my-key

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

ViaCEP is consulted internally — the client only sends the ZIP code.

---

### 3. Get trainer by ID

```http
GET /api/v1/trainers/a1b2c3d4-e5f6-7890-abcd-ef1234567890
X-API-Key: my-key
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

### 4. Create team

```http
POST /api/v1/teams
Content-Type: application/json
X-API-Key: my-key

{
  "name": "Kanto Team",
  "trainerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

```json
// 201 Created
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "Kanto Team",
  "status": "active",
  "trainerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2026-05-03T14:05:00.000Z"
}
```

---

### 5. Add Pokémon to team

The endpoint accepts the name or the numeric ID from PokéAPI. On the first call, the Pokémon is fetched from PokéAPI and cached locally — subsequent calls use the cache.

```http
POST /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901/pokemon
Content-Type: application/json
X-API-Key: my-key

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

Repeat for more Pokémon. The `pokemonName` field accepts lowercase names or `pokemonId` (PokéAPI integer):

```http
POST /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901/pokemon
{ "pokemonName": "charizard" }

POST /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901/pokemon
{ "pokemonName": "blastoise" }
```

Possible errors: `409` if the Pokémon is already in the team, `422` if the team is full (5 slots) or archived.

---

### 6. Get team by ID

```http
GET /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901
X-API-Key: my-key
```

```json
// 200 OK
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "Kanto Team",
  "status": "active",
  "pokemon": [
    { "slot": 1, "pokemon": { "name": "pikachu",   "types": ["electric"] } },
    { "slot": 2, "pokemon": { "name": "charizard",  "types": ["fire", "flying"] } },
    { "slot": 3, "pokemon": { "name": "blastoise",  "types": ["water"] } }
  ]
}
```

---

### 7. Analyze team types

```http
GET /api/v1/teams/b2c3d4e5-f6a7-8901-bcde-f12345678901/analysis
X-API-Key: my-key
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

The analysis is calculated from type effectiveness data cached in `POKEMON_TYPES` — no external call if the cache is valid.

---

### 8. List trainer's teams

```http
GET /api/v1/trainers/a1b2c3d4-e5f6-7890-abcd-ef1234567890/teams?limit=10&offset=0
X-API-Key: my-key
```

```json
// 200 OK
{
  "data": [
    { "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "name": "Kanto Team", "status": "active" }
  ],
  "total": 1
}
```
