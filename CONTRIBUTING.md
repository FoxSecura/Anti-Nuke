# Contributing

Contributions are welcome.

1. Create a focused branch.
2. Keep provider-specific logic inside adapters.
3. Add tests for new modules and edge cases.
4. Preserve the separation between detection and enforcement.
5. Run `npm run check`, `npm test`, `npm run build`, and `npm pack --dry-run`.

A module should have a stable ID, configurable thresholds, bounded state, reset support when stateful, structured evidence, and no direct destructive action.
