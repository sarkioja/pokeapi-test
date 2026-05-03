# Migrations

`synchronize: false` em todos os ambientes — o schema é gerenciado exclusivamente por migrations TypeORM.

## Comandos

```bash
# Gerar nova migration a partir das entidades
npm run migration:generate -- src/infrastructure/database/typeorm/migrations/NomeDaMigration

# Aplicar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert

# Listar status das migrations
npm run migration:show
```

---

## Fluxo de deploy

O `Dockerfile` (stage `production`) executa as migrations antes de subir a aplicação:

```
npm run migration:run && node dist/main.js
```

Em CI, as migrations são aplicadas sobre o PostgreSQL do GitHub Actions antes dos testes de integração e E2E.

---

## Índices especiais

Criados via migration (não gerenciáveis pelo `synchronize`):

| Índice | Tabela | Propósito |
|--------|--------|-----------|
| `trainers_email_active` | `trainers(email) WHERE deleted_at IS NULL` | Garante unicidade de e-mail apenas entre registros ativos |
| `UNIQUE(team_id, pokemon_id)` | `team_pokemon` | Impede duplicatas de pokémon no mesmo time |
