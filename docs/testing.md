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
| Unit | 60 |
| Integration | 13 |
| E2E | 33 |
| **Total** | **106** |

---

## Estrutura

- **Unit** (`*.spec.ts`) — co-localizados com os use cases em `src/`; testam lógica de negócio com mocks
- **Integration** (`*.int-spec.ts`) — co-localizados com os repositórios em `src/`; testam queries TypeORM contra banco real
- **E2E** (`test/e2e/*.e2e-spec.ts`) — sobem o `AppModule` completo via Supertest; cobrem todos os endpoints com cenários de sucesso e erro

---

## Testes unitários

### `GetTrainerUseCase`
| Teste | O que valida |
|-------|-------------|
| returns trainer when found | Retorna o treinador quando encontrado pelo UUID |
| throws ResourceNotFoundException when not found | Lança 404 para UUID inexistente |
| returns paginated trainers | `findAll` repassa `limit` e `offset` e retorna `{ data, total }` |

### `UpdateTrainerUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when trainer does not exist | Rejeita atualização de treinador inexistente sem chamar o repositório |
| throws EmailConflictException when new email is already taken | Rejeita troca de e-mail quando já está em uso por outro treinador ativo |
| skips email check when email is not being updated | Não chama `existsActiveByEmail` quando o campo `email` não está no payload |
| updates and returns trainer when new email is available | Verifica disponibilidade e persiste quando o e-mail está livre |

### `CreateTrainerUseCase`
| Teste | O que valida |
|-------|-------------|
| creates trainer when email is not taken | Cria o treinador e persiste quando o e-mail está disponível |
| throws EmailConflictException when email is already in use | Rejeita criação com e-mail já em uso sem chamar o repositório |

### `DeleteTrainerUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when trainer does not exist | Rejeita deleção de treinador inexistente |
| soft-deletes trainer and cascades to teams in a single transaction | Soft-deleta o treinador e todos os seus times em transação única |

### `EnrichTrainerCepUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when trainer does not exist | Rejeita enriquecimento para treinador inexistente |
| throws InvalidCepException when CEP format is invalid | Rejeita CEP com formato inválido antes de qualquer chamada ao ViaCEP |
| enriches trainer address when CEP is valid | Consulta o ViaCEP e persiste o endereço completo |
| strips hyphen from CEP before lookup | Normaliza CEP com hífen (ex: `01310-100`) antes de enviar ao ViaCEP |
| propagates error when ViaCEP cannot find the CEP | Repassa o erro quando o ViaCEP retorna CEP inexistente |

### `RestoreTrainerUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when trainer does not exist | Rejeita restore de treinador não encontrado |
| throws EmailConflictException when email is taken by another active trainer | Rejeita restore quando outro treinador ativo já usa o e-mail |
| restores trainer and associated teams | Restaura o treinador e os times deletados na mesma transação |

### `CreateTeamUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when trainer does not exist | Rejeita criação de time para treinador inexistente |
| creates and returns team when trainer exists | Cria o time com nome e `trainerId` corretos quando o treinador existe |

### `GetTeamUseCase`
| Teste | O que valida |
|-------|-------------|
| returns team when found | Retorna o time com o roster de pokémon quando encontrado |
| throws ResourceNotFoundException when team not found | Lança 404 para UUID de time inexistente |
| throws ResourceNotFoundException when trainer does not exist | Rejeita listagem por treinador inexistente sem consultar times |
| returns paginated teams when trainer exists | Repassa `limit` e `offset` e retorna `{ data, total }` dos times do treinador |

### `UpdateTeamUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when team does not exist | Rejeita atualização de time inexistente |
| updates and returns team | Persiste e retorna o time com os dados atualizados |

### `DeleteTeamUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when team does not exist | Rejeita deleção de time inexistente sem chamar o repositório |
| soft deletes team when found | Chama `softDelete` com o ID correto quando o time existe |

### `RemovePokemonFromTeamUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when team does not exist | Rejeita remoção quando o time não existe |
| throws ResourceNotFoundException when slot is not in team | Rejeita remoção quando o slot UUID não pertence ao time |
| removes pokemon slot from team | Chama `removePokemon` com `teamId` e `slotId` corretos |

### `AddPokemonToTeamUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when team does not exist | Rejeita adição em time inexistente |
| throws TeamArchivedException when team is archived | Rejeita adição em time arquivado |
| throws TeamFullException when team already has 5 pokemon | Rejeita quando o time atingiu o limite de 5 pokémon |
| throws DuplicatePokemonException when pokemon is already in team | Rejeita pokémon já presente no time |
| adds pokemon to the next available slot and returns updated team | Insere no próximo slot livre e retorna o time atualizado |

### `AnalyzeTeamTypesUseCase`
| Teste | O que valida |
|-------|-------------|
| throws ResourceNotFoundException when team does not exist | Rejeita análise de time inexistente |
| returns correct weaknesses, resistances, and immunities for electric type | Calcula fraquezas, resistências e imunidades corretamente para tipo elétrico |
| skips types for which getOrFetchType returns null | Ignora tipos cujo `GetOrFetchTypeUseCase` retorne `null` (PokéAPI indisponível e sem cache) |

### `GetOrFetchTypeUseCase`
| Teste | O que valida |
|-------|-------------|
| returns cached relations when fresh | Retorna relações locais sem chamar a PokéAPI quando o TTL é válido |
| fetches from PokéAPI when cache is missing | Busca na PokéAPI e persiste localmente quando não há cache |
| fetches from PokéAPI when cache is stale | Re-busca na PokéAPI quando o TTL expirou |
| returns stale cache when PokéAPI is unavailable | Retorna dado expirado com warning quando a PokéAPI está fora do ar |
| returns null when PokéAPI is unavailable and no cache exists | Retorna `null` quando a PokéAPI falha e não há nenhum cache local |

### `GetOrFetchPokemonUseCase`
| Teste | O que valida |
|-------|-------------|
| returns cached pokemon when TTL is still fresh (by name) | Retorna dado local sem chamar a PokéAPI quando o TTL é válido |
| fetches from PokéAPI when pokemon is not cached | Busca na PokéAPI e persiste localmente quando não há cache |
| re-fetches from PokéAPI when cached pokemon is stale | Re-busca na PokéAPI quando o TTL expirou |
| returns stale data when PokéAPI is unavailable and cache exists | Retorna dado expirado com warning quando a PokéAPI está fora do ar |
| throws ExternalServiceException when PokéAPI fails and no cache exists | Lança 502 quando a PokéAPI falha e não há nenhum cache local |
| returns cached pokemon when TTL is fresh (by ID) | Retorna dado local por `pokeapi_id` sem chamar a PokéAPI |
| fetches from PokéAPI when not cached (by ID) | Busca na PokéAPI por ID numérico quando não há cache |

### `ListPokemonUseCase`
| Teste | O que valida |
|-------|-------------|
| returns the page from the repository | Retorna a página com os dados e total vindos do repositório |
| forwards limit and offset to the repository | Repassa os parâmetros de paginação corretamente |
| returns empty page when no pokemon are cached | Retorna página vazia quando não há pokémon no cache local |

---

## Testes de integração

### `TrainerTypeOrmRepository`
| Teste | O que valida |
|-------|-------------|
| creates and finds a trainer by id | Persiste um treinador e o recupera por UUID |
| returns null when trainer does not exist | Retorna `null` para UUID inexistente sem lançar erro |
| paginates trainers correctly | `findAll` respeita `limit` e `offset` e retorna o total correto |
| updates trainer fields | `update` persiste alterações de nome e e-mail |
| updates trainer address from CEP lookup | `updateAddress` persiste os campos de endereço preenchidos pelo ViaCEP |
| soft-deletes trainer (findById returns null after delete) | `softDelete` marca `deleted_at` e `findById` passa a retornar `null` |
| restores soft-deleted trainer | `restore` limpa `deleted_at` e o treinador volta a ser encontrado |
| existsActiveByEmail returns true for active email and false after soft-delete | Índice parcial funciona corretamente — e-mail liberado após soft delete |

### `PokemonTypeOrmRepository`
| Teste | O que valida |
|-------|-------------|
| upserts pokemon by pokeapi_id and finds by name | Cria pokémon via upsert e o recupera por nome |
| upserts again updating fetched_at (idempotent) | Segunda chamada de upsert atualiza `fetched_at` sem criar duplicata |
| finds pokemon by pokeapi_id | Recupera pokémon pelo ID numérico da PokéAPI |
| paginates pokemon list | `findAll` respeita `limit` e `offset` |
| upserts and retrieves pokemon type damage relations | Persiste e recupera relações de efetividade de tipos como JSONB |

---

## Testes E2E

### `Trainers`
| Teste | O que valida |
|-------|-------------|
| returns 401 without API key | Todos os endpoints protegidos rejeitam requisição sem `X-API-Key` |
| returns 400 on invalid body | Validação de DTO rejeita body malformado |
| creates trainer and returns 201 | Fluxo completo de criação via HTTP |
| returns 409 on duplicate email | Conflito de e-mail retorna status correto |
| returns paginated list | `GET /trainers` retorna `data` e `total` com paginação |
| returns trainer by id | `GET /trainers/:id` retorna o recurso completo |
| returns 404 for unknown id | UUID inexistente retorna 404 com body de erro padronizado |
| updates trainer name | `PATCH /trainers/:id` persiste e retorna o campo atualizado |
| returns 400 for invalid CEP format | `PATCH /trainers/:id/cep` rejeita CEP com formato inválido |
| soft-deletes trainer and returns 204 | `DELETE /trainers/:id` retorna 204 e esconde o recurso em buscas |
| restores soft-deleted trainer | `PATCH /trainers/:id/restore` reativa o treinador |
| returns 409 when email is taken after restore | Restore bloqueado quando e-mail foi reutilizado por outro treinador |

### `Teams`
| Teste | O que valida |
|-------|-------------|
| creates a team linked to a trainer | Cria time com `trainerId` válido e retorna 201 |
| returns 404 when trainer does not exist | Criação de time com `trainerId` inexistente retorna 404 |
| lists teams for a trainer with pokemon roster | `GET /trainers/:id/teams` retorna times com pokémon |
| returns team with pokemon roster | `GET /teams/:id` retorna time com slots preenchidos |
| returns 404 for unknown team | UUID de time inexistente retorna 404 |
| updates team name | `PATCH /teams/:id` persiste alteração de nome |
| archives a team | `PATCH /teams/:id` com `status: archived` bloqueia adições futuras |
| adds a pokemon to the team (fetches from PokéAPI) | `POST /teams/:id/pokemon` busca da PokéAPI e insere no slot correto |
| returns 409 when same pokemon is added twice | Pokémon duplicado retorna 409 |
| returns 422 when team is archived | Adição em time arquivado retorna 422 |
| returns 422 when team is full (6th pokemon) | Sexto pokémon retorna 422 |
| removes a pokemon from the team | `DELETE /teams/:teamId/pokemon/:slotId` remove o slot |
| soft-deletes a team and returns 204 | `DELETE /teams/:id` retorna 204 e esconde o time |
| returns type analysis for a team | `GET /teams/:id/analysis` retorna fraquezas e resistências calculadas |

### `Pokemon`
| Teste | O que valida |
|-------|-------------|
| returns empty list when no pokemon cached | `GET /pokemon` retorna lista vazia quando o cache está limpo |
| returns cached pokemon after a fetch | Lista inclui pokémon após ele ter sido buscado |
| fetches and caches pikachu by name from PokéAPI | `GET /pokemon/pikachu` busca na PokéAPI e retorna os dados |
| fetches pikachu by numeric pokeapi_id | `GET /pokemon/25` funciona por ID numérico |
| returns 200 from cache on second request (no PokéAPI call) | Segunda requisição usa cache local — sem chamada externa |
| returns 404 for non-existent pokemon name | Nome inexistente na PokéAPI retorna 404 |
| returns 401 without API key | Endpoint protegido rejeita requisição sem `X-API-Key` |

---

## Hooks locais (Husky)

O pre-push roda `test:unit` automaticamente antes de cada push.  
Integration e E2E rodam apenas no CI (requerem banco de dados).
