# Convenções Git

## Mensagens de commit — Conventional Commits

Formato: `type(scope): description`

| Tipo | Quando usar |
|------|-------------|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Configuração, dependências, scripts |
| `docs` | Documentação |
| `test` | Adição ou ajuste de testes |
| `refactor` | Refatoração sem mudança de comportamento |
| `ci` | GitHub Actions, pipelines |
| `perf` | Melhoria de performance |

Exemplos:

```
feat(team): add pokemon slot validation
fix(pokeapi): propagate 404 as ResourceNotFoundException
chore: add husky pre-commit and pre-push hooks
test(trainer): add ViaCEP error propagation unit test
docs: update README with deploy section
```

---

## Estratégia de branches — Trunk-Based Development adaptado

```
main (produção — protegida)
  └── develop (staging — protegida)
        ├── feature/<descricao-curta>
        ├── fix/<descricao-curta>
        └── chore/<descricao-curta>
```

### Regras

- Branches de trabalho (`feature/`, `fix/`, `chore/`) têm vida curta — PR para `develop` assim que a tarefa estiver concluída
- `main` recebe merge somente de `develop` via PR aprovado
- Sem branches de release ou hotfix separadas — fixes urgentes vão por `fix/` para `develop` e sobem via processo normal

### CI por branch

| Branch | O que roda |
|--------|-----------|
| `feature/**` | Lint + unit tests (sem banco — feedback rápido) |
| `develop` | Suite completa: lint + unit + integration + E2E |
| `main` | Suite completa + build Docker + deploy Render prod |

---

## Hooks locais (Husky)

| Hook | O que roda | Quando falha |
|------|-----------|--------------|
| `pre-commit` | `lint` + `typecheck` | Bloqueia o commit |
| `pre-push` | `test:unit` | Bloqueia o push |

Integration e E2E não rodam localmente — requerem banco de dados e ficam apenas no CI.
