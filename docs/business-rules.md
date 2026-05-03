# Regras de Negócio

## Time × Pokémon

- **Máximo 5 pokémon por time** — validado por `COUNT(*) < 5`; slots com buracos permitidos → 422 `TEAM_FULL`
- **Sem duplicatas no time** — verificação por `pokemonId` + `UNIQUE(team_id, pokemon_id)` no banco → 409 `DUPLICATE_POKEMON`
- **Unicidade de slot** — `UNIQUE(team_id, slot)` no banco garante que dois pokémon não ocupem o mesmo slot; o use case seleciona o próximo slot livre automaticamente
- **Time arquivado não aceita pokémon** → 422 `TEAM_ARCHIVED`
- **Nickname** — campo opcional em `TeamPokemon`; não afeta a identidade do pokémon no time

---

## Soft Delete de Treinador

O registro não é apagado fisicamente — apenas marcado com `deleted_at`. Ao deletar um Treinador:

1. Todos os times do treinador são soft-deletados (em transação)
2. O treinador é soft-deletado
3. `GET /trainers/:id` retorna 404 para registros com `deleted_at IS NOT NULL`

O treinador pode ser restaurado via `PATCH /trainers/:id/restore`. Se outro usuário assumiu o mesmo e-mail enquanto o primeiro estava deletado, o restore retorna 409 (índice único parcial `WHERE deleted_at IS NULL`).

### Soft Delete individual de Time

Times podem ser soft-deletados individualmente (`DELETE /teams/:id`) sem afetar o treinador. Um time deletado de forma independente tem `deleted_at` diferente do treinador — essa distinção é fundamental para o comportamento do restore em cascata descrito abaixo.

### Restore em cascata

O restore do treinador restaura automaticamente os times que foram deletados **na mesma transação** que o treinador, identificados pelo `deleted_at` idêntico. Times que já estavam deletados antes (deletados independentemente pelo usuário) **não são restaurados**.

```
PATCH /trainers/:id/restore
  └── Restaura o Treinador
  └── Restaura Times com deleted_at = trainer.deleted_at  ← mesma transação original
  └── Times com deleted_at diferente permanecem deletados  ← deletados independentemente
  └── TeamPokemon nunca foram removidos (soft delete não dispara CASCADE)
```

Não existe restore individual de Time — se um time precisa ser reativado de forma isolada, a operação deve ser implementada como um endpoint próprio.

> Por que soft delete e não `active: boolean`? Ver comparativo em [erd.md](erd.md).

---

## Cache — PokéAPI

- Pokémon é buscado na PokéAPI na primeira requisição e persistido localmente (upsert por `pokeapi_id`)
- Requisições seguintes usam o dado local enquanto `fetched_at` estiver dentro do TTL (`POKEMON_TTL_HOURS`, padrão 24h)
- Dado stale → nova busca na PokéAPI e upsert
- **Fallback resiliente**: PokéAPI indisponível + dado local existente → retorna dado stale + warning no log (sem 503); 502 apenas se não houver dado local algum
- Tipos de pokémon (`POKEMON_TYPES`) têm TTL separado (`POKEMON_TYPE_TTL_DAYS`, padrão 7 dias) — usados no endpoint `/analysis`

Ver fluxo completo em [architecture.md](architecture.md).

---

## Integração ViaCEP

`PATCH /trainers/:id/cep` recebe um CEP, consulta o ViaCEP e persiste o endereço completo:

- CEP validado por regex (8 dígitos, `CepVO` puro TypeScript) antes de qualquer chamada externa → 400 se inválido
- ViaCEP retorna HTTP 200 mesmo para CEP inexistente com `{ "erro": true }` no body — o adapter detecta e retorna 404
- Campos persistidos: logradouro, bairro, cidade, estado

---

## Hierarquia de Erros de Domínio

Erros de domínio são classes puras (sem imports de NestJS). O `GlobalExceptionFilter` mapeia para HTTP:

```
DomainException (base)         → 422 DOMAIN_ERROR (fallback genérico)
├── TeamFullException          → 422
├── DuplicatePokemonException  → 409
├── TeamArchivedException      → 422
├── InvalidCepException        → 400
├── EmailConflictException     → 409
└── ResourceNotFoundException  → 404

InfrastructureException (base)
├── ExternalServiceException        → 502  (ViaCEP indisponível; PokéAPI só sem cache local)
└── CepNotFoundExternalException    → 404
```
