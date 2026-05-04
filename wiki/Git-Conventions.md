# Git Conventions

## Commit Messages — Conventional Commits

Format: `type(scope): description`

| Type | When to use |
|------|------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Configuration, dependencies, scripts |
| `docs` | Documentation |
| `test` | Adding or adjusting tests |
| `refactor` | Refactoring without behavior change |
| `ci` | GitHub Actions, pipelines |
| `perf` | Performance improvement |

Examples:

```
feat(team): add pokemon slot validation
fix(pokeapi): propagate 404 as ResourceNotFoundException
chore: add husky pre-commit and pre-push hooks
test(trainer): add ViaCEP error propagation unit test
docs: update README with deploy section
```

---

## Branching Strategy — Adapted Trunk-Based Development

```
main (production — protected)
  └── develop (staging — protected)
        ├── feature/<short-description>
        ├── fix/<short-description>
        └── chore/<short-description>
```

### Rules

- Working branches (`feature/`, `fix/`, `chore/`) are short-lived — PR to `develop` as soon as the task is done
- `main` only receives merges from `develop` via approved PR
- No separate release or hotfix branches — urgent fixes go through `fix/` to `develop` and follow the normal process

### CI by Branch

| Branch | What runs |
|--------|-----------|
| `feature/**` | Lint + unit tests (no database — fast feedback) |
| `develop` | Full suite: lint + unit + integration + E2E |
| `main` | Full suite + Docker build + Render prod deploy |

---

## Local Hooks (Husky)

| Hook | What runs | When it fails |
|------|-----------|---------------|
| `pre-commit` | `lint` + `typecheck` | Blocks the commit |
| `pre-push` | `test:unit` | Blocks the push |

Integration and E2E tests don't run locally — they require a database and are CI-only.
