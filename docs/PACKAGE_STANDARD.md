# FoxSecura package standard

Security packages use a common shape:

- `src/core`: provider-independent contracts and engine
- `src/modules`: independent detectors
- `src/presets`: optional curated module sets
- `src/adapters`: integrations such as Discord.js
- `src/index.ts`: stable public exports

Packages must keep detection separate from enforcement, expose explicit lifecycle methods on adapters, support custom modules and ignore policies, avoid mandatory databases or environment loaders, and ship tests, CI, CodeQL, dependency auditing, community files, and an MIT license.
