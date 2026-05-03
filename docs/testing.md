# Testes

## Executando

```bash
# Unitários (sem banco)
npm run test:unit

# Integração (banco real — schema 'test' isolado)
npm run test:integration

# E2E (AppModule completo — schema 'test' isolado)
npm run test:e2e
```

---

## Isolamento de dados

Os testes de integração e E2E usam o schema PostgreSQL `test` dentro do banco `pokeapi_dev`.

O `globalSetup` recria o schema e aplica migrations antes de cada run — **dados em `public.*` nunca são afetados**.

Cada suite limpa suas tabelas no `beforeEach` via `DELETE FROM` (dentro do schema `test`).

---

## Cobertura atual

| Suite | Testes |
|-------|--------|
| Unit | 28 |
| Integration | 13 |
| E2E | 33 |
| **Total** | **74** |

---

## Estrutura

- **Unit** (`*.spec.ts`) — co-localizados com os use cases em `src/`; testam lógica de negócio com mocks
- **Integration** (`*.int-spec.ts`) — co-localizados com os repositórios em `src/`; testam queries TypeORM contra banco real
- **E2E** (`test/e2e/*.e2e-spec.ts`) — sobem o `AppModule` completo via Supertest; cobrem todos os endpoints com cenários de sucesso e erro

---

## Hooks locais (Husky)

O pre-push roda `test:unit` automaticamente antes de cada push.  
Integration e E2E rodam apenas no CI (requerem banco de dados).
