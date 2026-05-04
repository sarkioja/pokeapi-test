# Migrations

`synchronize: false` in all environments — the schema is managed exclusively by TypeORM migrations.

## Commands

```bash
# Generate a new migration from entities
npm run migration:generate -- src/infrastructure/database/typeorm/migrations/MigrationName

# Apply pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# List migration status
npm run migration:show
```

---

## Deploy Flow

The `Dockerfile` (production stage) runs migrations before starting the application:

```
npm run migration:run && node dist/main.js
```

In CI, migrations are applied against the GitHub Actions PostgreSQL instance before integration and E2E tests.

---

## Special Indices

Created via migration (not manageable by `synchronize`):

| Index | Table | Purpose |
|-------|-------|---------|
| `trainers_email_active` | `trainers(email) WHERE deleted_at IS NULL` | Ensures email uniqueness only among active records |
| `UNIQUE(team_id, pokemon_id)` | `team_pokemon` | Prevents duplicate Pokémon in the same team |
| `UNIQUE(team_id, slot)` | `team_pokemon` | Ensures two Pokémon don't occupy the same slot within the same team |
