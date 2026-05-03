# Endpoints `/api/v1`

Todas as rotas exigem o header `X-API-Key: <chave>` — exceto `GET /api/health`.

Explore interativamente via **Swagger UI**: `http://localhost:3000/api`

---

## Trainers

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| `POST` | `/trainers` | Criar treinador | 201, 400, 409 |
| `GET` | `/trainers?limit&offset` | Listar (paginado) | 200 |
| `GET` | `/trainers/:id` | Buscar por ID | 200, 404 |
| `PATCH` | `/trainers/:id` | Atualizar nome ou e-mail | 200, 400, 404 |
| `PATCH` | `/trainers/:id/cep` | Enriquecer endereço via ViaCEP | 200, 400, 404 |
| `DELETE` | `/trainers/:id` | Soft delete (+ soft-deleta times) | 204, 404 |
| `PATCH` | `/trainers/:id/restore` | Reativar treinador | 200, 404, 409 |

---

## Teams

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| `POST` | `/teams` | Criar time | 201, 400, 404 |
| `GET` | `/trainers/:trainerId/teams?limit&offset` | Listar times de um treinador | 200, 404 |
| `GET` | `/teams/:id` | Buscar time com pokémons | 200, 404 |
| `PATCH` | `/teams/:id` | Atualizar nome ou status | 200, 400, 404 |
| `DELETE` | `/teams/:id` | Soft delete | 204, 404 |
| `POST` | `/teams/:id/pokemon` | Adicionar pokémon ao time | 201, 400, 404, 409, 422 |
| `DELETE` | `/teams/:teamId/pokemon/:slotId` | Remover pokémon do time | 204, 404 |
| `GET` | `/teams/:id/analysis` | Análise de tipos (fraquezas/resistências) | 200, 404 |

---

## Pokémon

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| `GET` | `/pokemon?limit&offset` | Listar pokémon no cache local (paginado) | 200 |
| `GET` | `/pokemon/:nameOrId` | Buscar/fetch por nome ou pokeapi_id | 200, 404 |

---

## Health

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Status do banco via @nestjs/terminus (público, sem API Key) |
