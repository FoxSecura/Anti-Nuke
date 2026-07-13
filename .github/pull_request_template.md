## Summary

Describe the change and its security impact.

## Checklist

- [ ] Detection remains separate from enforcement
- [ ] Stateful modules have bounded windows and reset behavior
- [ ] Tests cover normal and suspicious behavior
- [ ] `npm run check` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] `npm pack --dry-run` passes
