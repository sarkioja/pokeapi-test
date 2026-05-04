# Testing

## Running Tests

```bash
# Unit tests (no database)
npm run test:unit

# Integration tests (real database — isolated 'test' schema)
npm run test:integration

# E2E tests (full AppModule — isolated 'test' schema)
npm run test:e2e
```

---

## Data Isolation

Integration and E2E tests use the `test` PostgreSQL schema inside the `pokeapi_dev` database.

The `globalSetup` recreates the schema and applies migrations before each run — **data in `public.*` is never affected**.

Each suite clears its tables in `beforeEach` via `DELETE FROM` (within the `test` schema).

---

## Current Coverage

| Suite | Tests |
|-------|-------|
| Unit | 31 |
| Integration | 13 |
| E2E | 33 |
| **Total** | **77** |

---

## Structure

- **Unit** (`*.spec.ts`) — co-located with use cases in `src/`; test business logic with mocks
- **Integration** (`*.int-spec.ts`) — co-located with repositories in `src/`; test TypeORM queries against a real database
- **E2E** (`test/e2e/*.e2e-spec.ts`) — spin up the full `AppModule` via Supertest; cover all endpoints with success and error scenarios

---

## Unit Tests

### `CreateTrainerUseCase`
| Test | What it validates |
|------|-------------------|
| creates trainer when email is not taken | Creates and persists the trainer when the email is available |
| throws EmailConflictException when email is already in use | Rejects creation with a taken email without calling the repository |

### `DeleteTrainerUseCase`
| Test | What it validates |
|------|-------------------|
| throws ResourceNotFoundException when trainer does not exist | Rejects deletion of a non-existent trainer |
| soft-deletes trainer and cascades to teams in a single transaction | Soft-deletes the trainer and all their teams in a single transaction |

### `EnrichTrainerCepUseCase`
| Test | What it validates |
|------|-------------------|
| throws ResourceNotFoundException when trainer does not exist | Rejects enrichment for non-existent trainer |
| throws InvalidCepException when CEP format is invalid | Rejects invalid ZIP code format before any ViaCEP call |
| enriches trainer address when CEP is valid | Queries ViaCEP and persists the full address |
| strips hyphen from CEP before lookup | Normalizes ZIP code with hyphen (e.g., `01310-100`) before sending to ViaCEP |
| propagates error when ViaCEP cannot find the CEP | Forwards the error when ViaCEP returns a non-existent ZIP code |

### `RestoreTrainerUseCase`
| Test | What it validates |
|------|-------------------|
| throws ResourceNotFoundException when trainer does not exist | Rejects restore of a not-found trainer |
| throws EmailConflictException when email is taken by another active trainer | Rejects restore when another active trainer already uses the email |
| restores trainer and associated teams | Restores the trainer and teams deleted in the same transaction |

### `AddPokemonToTeamUseCase`
| Test | What it validates |
|------|-------------------|
| throws ResourceNotFoundException when team does not exist | Rejects addition to a non-existent team |
| throws TeamArchivedException when team is archived | Rejects addition to an archived team |
| throws TeamFullException when team already has 5 pokemon | Rejects when team has reached the 5 Pokémon limit |
| throws DuplicatePokemonException when pokemon is already in team | Rejects Pokémon already present in the team |
| adds pokemon to the next available slot and returns updated team | Inserts in the next available slot and returns the updated team |

### `AnalyzeTeamTypesUseCase`
| Test | What it validates |
|------|-------------------|
| throws ResourceNotFoundException when team does not exist | Rejects analysis of non-existent team |
| returns correct weaknesses, resistances, and immunities for electric type | Correctly calculates weaknesses, resistances, and immunities for electric type |
| fetches type from PokéAPI when not in local cache | Fetches type effectiveness from PokéAPI when not cached |
| uses stale cache when PokéAPI is unavailable | Uses stale cache as fallback when PokéAPI is unavailable |

### `GetOrFetchPokemonUseCase`
| Test | What it validates |
|------|-------------------|
| returns cached pokemon when TTL is still fresh (by name) | Returns local data without calling PokéAPI when TTL is valid |
| fetches from PokéAPI when pokemon is not cached | Fetches from PokéAPI and persists locally when no cache exists |
| re-fetches from PokéAPI when cached pokemon is stale | Re-fetches from PokéAPI when TTL has expired |
| returns stale data when PokéAPI is unavailable and cache exists | Returns expired data with warning when PokéAPI is down |
| throws ExternalServiceException when PokéAPI fails and no cache exists | Throws 502 when PokéAPI fails and there is no local cache |
| returns cached pokemon when TTL is fresh (by ID) | Returns local data by `pokeapi_id` without calling PokéAPI |
| fetches from PokéAPI when not cached (by ID) | Fetches from PokéAPI by numeric ID when no cache exists |

### `ListPokemonUseCase`
| Test | What it validates |
|------|-------------------|
| returns the page from the repository | Returns the page with data and total from the repository |
| forwards limit and offset to the repository | Correctly passes pagination parameters |
| returns empty page when no pokemon are cached | Returns empty page when no Pokémon are in the local cache |

---

## Integration Tests

### `TrainerTypeOrmRepository`
| Test | What it validates |
|------|-------------------|
| creates and finds a trainer by id | Persists a trainer and retrieves it by UUID |
| returns null when trainer does not exist | Returns `null` for non-existent UUID without throwing |
| paginates trainers correctly | `findAll` respects `limit` and `offset` and returns the correct total |
| updates trainer fields | `update` persists name and email changes |
| updates trainer address from CEP lookup | `updateAddress` persists address fields populated by ViaCEP |
| soft-deletes trainer (findById returns null after delete) | `softDelete` marks `deleted_at` and `findById` starts returning `null` |
| restores soft-deleted trainer | `restore` clears `deleted_at` and the trainer becomes findable again |
| existsActiveByEmail returns true for active email and false after soft-delete | Partial index works correctly — email released after soft delete |

### `PokemonTypeOrmRepository`
| Test | What it validates |
|------|-------------------|
| upserts pokemon by pokeapi_id and finds by name | Creates Pokémon via upsert and retrieves it by name |
| upserts again updating fetched_at (idempotent) | Second upsert call updates `fetched_at` without creating a duplicate |
| finds pokemon by pokeapi_id | Retrieves Pokémon by PokéAPI numeric ID |
| paginates pokemon list | `findAll` respects `limit` and `offset` |
| upserts and retrieves pokemon type damage relations | Persists and retrieves type effectiveness relations as JSONB |

---

## E2E Tests

### `Trainers`
| Test | What it validates |
|------|-------------------|
| returns 401 without API key | All protected endpoints reject requests without `X-API-Key` |
| returns 400 on invalid body | DTO validation rejects malformed body |
| creates trainer and returns 201 | Full creation flow via HTTP |
| returns 409 on duplicate email | Email conflict returns correct status |
| returns paginated list | `GET /trainers` returns `data` and `total` with pagination |
| returns trainer by id | `GET /trainers/:id` returns the full resource |
| returns 404 for unknown id | Non-existent UUID returns 404 with standardized error body |
| updates trainer name | `PATCH /trainers/:id` persists and returns the updated field |
| returns 400 for invalid CEP format | `PATCH /trainers/:id/cep` rejects invalid ZIP code format |
| soft-deletes trainer and returns 204 | `DELETE /trainers/:id` returns 204 and hides the resource from lookups |
| restores soft-deleted trainer | `PATCH /trainers/:id/restore` reactivates the trainer |
| returns 409 when email is taken after restore | Restore blocked when email was reused by another trainer |

### `Teams`
| Test | What it validates |
|------|-------------------|
| creates a team linked to a trainer | Creates team with valid `trainerId` and returns 201 |
| returns 404 when trainer does not exist | Team creation with non-existent `trainerId` returns 404 |
| lists teams for a trainer with pokemon roster | `GET /trainers/:id/teams` returns teams with Pokémon |
| returns team with pokemon roster | `GET /teams/:id` returns team with filled slots |
| returns 404 for unknown team | Non-existent team UUID returns 404 |
| updates team name | `PATCH /teams/:id` persists name change |
| archives a team | `PATCH /teams/:id` with `status: archived` blocks future additions |
| adds a pokemon to the team (fetches from PokéAPI) | `POST /teams/:id/pokemon` fetches from PokéAPI and inserts in the correct slot |
| returns 409 when same pokemon is added twice | Duplicate Pokémon returns 409 |
| returns 422 when team is archived | Addition to archived team returns 422 |
| returns 422 when team is full (6th pokemon) | Sixth Pokémon returns 422 |
| removes a pokemon from the team | `DELETE /teams/:teamId/pokemon/:slotId` removes the slot |
| soft-deletes a team and returns 204 | `DELETE /teams/:id` returns 204 and hides the team |
| returns type analysis for a team | `GET /teams/:id/analysis` returns calculated weaknesses and resistances |

### `Pokemon`
| Test | What it validates |
|------|-------------------|
| returns empty list when no pokemon cached | `GET /pokemon` returns empty list when cache is clean |
| returns cached pokemon after a fetch | List includes Pokémon after it has been fetched |
| fetches and caches pikachu by name from PokéAPI | `GET /pokemon/pikachu` fetches from PokéAPI and returns data |
| fetches pikachu by numeric pokeapi_id | `GET /pokemon/25` works by numeric ID |
| returns 200 from cache on second request (no PokéAPI call) | Second request uses local cache — no external call |
| returns 404 for non-existent pokemon name | Non-existent name in PokéAPI returns 404 |
| returns 401 without API key | Protected endpoint rejects request without `X-API-Key` |

---

## Local Hooks (Husky)

The pre-push hook runs `test:unit` automatically before each push.  
Integration and E2E only run in CI (require a database).
