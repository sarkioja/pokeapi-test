# Arquitetura

## Camadas

```mermaid
flowchart TD
    subgraph PRESENTATION["Presentation Layer (Controllers + DTOs)"]
        TC[TrainerController]
        TEC[TeamController]
        PC[PokemonController]
        HC[HealthController]
    end

    subgraph APPLICATION["Application Layer (Use Cases)"]
        CT[CreateTrainerUseCase]
        ECE[EnrichTrainerCepUseCase]
        DTR[DeleteTrainerUseCase]
        CTE[CreateTeamUseCase]
        APT[AddPokemonToTeamUseCase]
        GOP[GetOrFetchPokemonUseCase]
        ATA[AnalyzeTeamTypesUseCase]
    end

    subgraph DOMAIN["Domain Layer (Entities + Ports)"]
        TE[TrainerEntity]
        TME[TeamEntity]
        PE[PokemonEntity]
        TRP[TrainerRepositoryPort]
        TMP[TeamRepositoryPort]
        PP[PokemonRepositoryPort]
        VP[ViaCepPort]
        PAP[PokeApiPort]
        ERR[DomainExceptions]
    end

    subgraph INFRASTRUCTURE["Infrastructure Layer (Adapters)"]
        TORM[TrainerTypeOrmRepository]
        TEORM[TeamTypeOrmRepository]
        PORM[PokemonTypeOrmRepository]
        VIAC[ViaCepClient]
        PKAPI[PokeApiClient]
        PG[(PostgreSQL)]
        VCEP[ViaCEP API]
        PKEXT[PokéAPI]
    end

    TC --> CT & ECE & DTR
    TEC --> CTE & APT & ATA
    PC --> GOP
    HC --> PG

    CT & ECE & DTR --> TRP
    ECE --> VP
    CTE & APT & ATA --> TMP
    APT & GOP --> PP
    ATA --> PAP

    TRP -.-> TORM
    TMP -.-> TEORM
    PP -.-> PORM
    VP -.-> VIAC
    PAP -.-> PKAPI

    TORM & TEORM & PORM --> PG
    VIAC --> VCEP
    PKAPI --> PKEXT
```

> A camada de **Domain** não possui nenhuma dependência de framework (sem imports de NestJS). Ports são interfaces — as implementações ficam em Infrastructure.

---

## Estratégia de Cache — PokéAPI

```mermaid
flowchart TD
    A[Requisição para um Pokémon] --> B{Existe no banco local?}
    B -- Não --> C[Busca na PokéAPI]
    B -- Sim --> D{fetched_at dentro do TTL?}
    D -- Sim / fresh --> E[Retorna dado local]
    D -- Não / stale --> F{PokéAPI disponível?}
    F -- Sim --> C
    F -- Não / timeout --> G[Retorna dado stale + warning no log]
    C --> H[Upsert no banco por pokeapi_id]
    H --> E
```

- **TTL configurável** via `POKEMON_TTL_HOURS` (padrão: 24h)
- **Fallback resiliente**: se a PokéAPI estiver indisponível mas houver dado local (mesmo stale), a API responde com o dado antigo e loga um warning — nunca retorna 503 quando há cache
- **Upsert por `pokeapi_id`**: garante idempotência e evita duplicatas entre variantes do mesmo pokémon
- **Cache de tipos** (`POKEMON_TYPES`): efetividade de tipos para `/analysis` é cacheada separadamente com TTL de 7 dias (`POKEMON_TYPE_TTL_DAYS`) — tipos raramente mudam

---

## Hierarquia de Erros de Domínio

Exceções de domínio são classes TypeScript puras, sem dependências de framework. O `GlobalExceptionFilter` mapeia para HTTP:

```
DomainException
├── TeamFullException           → 422 Unprocessable Entity
├── DuplicatePokemonException   → 409 Conflict
├── TeamArchivedException       → 422 Unprocessable Entity
└── InvalidCepException         → 400 Bad Request

ResourceNotFoundException       → 404 Not Found
CepNotFoundExternalException    → 404 Not Found
ExternalServiceException        → 502 Bad Gateway
```
