# Business Rules

## Team × Pokémon

- **Maximum 5 Pokémon per team** — validated by `COUNT(*) < 5`; gaps in slots are allowed → 422 `TEAM_FULL`
- **No duplicates in team** — checked by `pokemonId` + `UNIQUE(team_id, pokemon_id)` in the database → 409 `DUPLICATE_POKEMON`
- **Slot uniqueness** — `UNIQUE(team_id, slot)` in the database ensures two Pokémon don't occupy the same slot; the use case automatically selects the next available slot
- **Archived team does not accept Pokémon** → 422 `TEAM_ARCHIVED`
- **Nickname** — optional field in `TeamPokemon`; does not affect the Pokémon's identity in the team

---

## Trainer Soft Delete

The record is not physically removed — it is only marked with `deleted_at`. When a Trainer is deleted:

1. All trainer's teams are soft-deleted (in a transaction)
2. The trainer is soft-deleted
3. `GET /trainers/:id` returns 404 for records with `deleted_at IS NOT NULL`

The trainer can be restored via `PATCH /trainers/:id/restore`. If another user has taken the same email while the first was deleted, the restore returns 409 (partial unique index `WHERE deleted_at IS NULL`).

### Individual Team Soft Delete

Teams can be soft-deleted individually (`DELETE /teams/:id`) without affecting the trainer. An independently deleted team has a `deleted_at` different from the trainer's — this distinction is fundamental to the cascade restore behavior described below.

### Cascade Restore

Restoring the trainer automatically restores teams that were deleted **in the same transaction** as the trainer, identified by the identical `deleted_at`. Teams that were already deleted before (independently deleted by the user) **are not restored**.

```
PATCH /trainers/:id/restore
  └── Restores the Trainer
  └── Restores Teams with deleted_at = trainer.deleted_at  ← same original transaction
  └── Teams with different deleted_at remain deleted        ← independently deleted
  └── TeamPokemon were never removed (soft delete doesn't trigger CASCADE)
```

There is no individual Team restore — if a team needs to be reactivated independently, the operation must be implemented as its own endpoint.

> Why soft delete instead of `active: boolean`? See the comparison in [[Database-ERD]].

---

## Cache — PokéAPI

- Pokémon is fetched from PokéAPI on the first request and persisted locally (upsert by `pokeapi_id`)
- Subsequent requests use local data while `fetched_at` is within the TTL (`POKEMON_TTL_HOURS`, default 24h)
- Stale data → new fetch from PokéAPI and upsert
- **Resilient fallback**: PokéAPI unavailable + local data exists → returns stale data + log warning (no 503); 502 only if there is no local data at all
- Pokémon types (`POKEMON_TYPES`) have a separate TTL (`POKEMON_TYPE_TTL_DAYS`, default 7 days) — used by the `/analysis` endpoint

See the full flow in [[Architecture]].

---

## ViaCEP Integration

`PATCH /trainers/:id/cep` receives a ZIP code, queries ViaCEP, and persists the full address:

- ZIP code validated by regex (8 digits, pure TypeScript `CepVO`) before any external call → 400 if invalid
- ViaCEP returns HTTP 200 even for non-existent ZIP codes with `{ "erro": true }` in the body — the adapter detects this and returns 404
- Persisted fields: street, neighborhood, city, state

---

## Domain Error Hierarchy

Domain errors are pure classes (no NestJS imports). The `GlobalExceptionFilter` maps them to HTTP:

```
DomainException (base)         → 422 DOMAIN_ERROR (generic fallback)
├── TeamFullException          → 422
├── DuplicatePokemonException  → 409
├── TeamArchivedException      → 422
├── InvalidCepException        → 400
├── EmailConflictException     → 409
└── ResourceNotFoundException  → 404

InfrastructureException (base)
├── ExternalServiceException        → 502  (ViaCEP unavailable; PokéAPI only without local cache)
└── CepNotFoundExternalException    → 404
```
