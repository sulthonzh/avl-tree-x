# Changelog

## Unreleased

### Polish
- Added ESLint flat config (eslint.config.mjs) with recommended rules
- Added c8 coverage reporting (test:coverage script)
- Added lint script, wired prepublishOnly to run tests + lint
- Added .gitignore (node_modules/, coverage/)
- Sharpened README hook (problem-first, not feature-first)

### Coverage
- 99.63% statements, 90% branches, 100% functions

## v1.1.0 (2026-06-19)

### Bug Fixes

- **fromJSON crash on null/undefined input** — `fromJSON({})` or `fromJSON(null)` threw cryptic TypeError. Now validates input is a plain object and throws descriptive error.
- **fromJSON blindly trusted `size` from untrusted JSON** — corrupted `size` field (e.g., `size: 999` for a 5-node tree) would report wrong size. Now recomputes size from actual tree structure.
- **`select(NaN)` returned `null` instead of `undefined`** — NaN passed the bounds check (`NaN < 0` and `NaN >= size` both evaluate to `false`). Now validates with `Number.isInteger()`.
- **`select(1.5)` accepted non-integer index** — could access wrong node via `selectNode` traversal. Now rejects non-integers.

### Added

- `--version` / `-V` / `version` CLI flag
- `exports` field in package.json for clean ESM/CJS consumption
- `files` field to limit npm package size
- `engines` field (Node >= 18)
- CHANGELOG.md

### Tests

- 35 new tests (50 → 85): fromJSON edge cases (null, non-object, corrupted size, missing root, custom comparator), select edge cases (NaN, Infinity, non-integer, -0), rank edge cases (empty, min, beyond max), rangeSearch edge cases (inverted range, single element, full range), insertAll edge cases (Set, generator, empty array), clear and reuse cycles, predecessor/successor edge cases (empty tree, single node, duplicates), large tree operations (1000 insertions, 500-element sort), toJSON structure validation, custom comparator with Dates and strings, delete edge cases (all-at-once, single, root repeatedly), iterator protocol compliance.

## v1.0.0 (2026-06-17)

- Initial release
- Zero-dependency AVL self-balancing binary search tree
- O(log n) insert, delete, search, min, max, predecessor, successor, rank, select
- Range queries, four traversal modes (in/pre/post/level-order)
- Iterator protocol (`for...of`, spread)
- Serialization (toJSON / fromJSON)
- Custom comparators
- CLI tool with insert, search, delete, range, order, rank, select, demo commands
- isValid() for AVL property verification
- 50 tests
