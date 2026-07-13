<div align="center">

# FoxSecura Anti-Nuke

**Discord Security Modules · Guild Integrity**

[![CI](https://img.shields.io/github/actions/workflow/status/FoxSecura/Anti-Nuke/ci.yml?branch=main&style=flat-square&logo=githubactions&logoColor=white&label=CI)](https://github.com/FoxSecura/Anti-Nuke/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/FoxSecura/Anti-Nuke/codeql.yml?branch=main&style=flat-square&logo=github&logoColor=white&label=CodeQL)](https://github.com/FoxSecura/Anti-Nuke/actions/workflows/codeql.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.js.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

</div>

`@foxsecura/anti-nuke` is the **guild-integrity category** of the FoxSecura Security Modules suite. It is an installable TypeScript package for existing Discord bots, not a standalone bot.

It detects destructive administrative activity from normalized guild mutation events and returns structured incidents. The consuming bot remains responsible for access revocation, lockdowns, recovery, logging, persistence, permissions, and deployment.

## FoxSecura security suite

| Package | Security category | Responsibility |
| --- | --- | --- |
| [`@foxsecura/anti-raid`](https://github.com/FoxSecura/Anti-Raid) | Raid protection | Detect coordinated or abnormal member joins. |
| [`@foxsecura/anti-spam`](https://github.com/FoxSecura/Anti-Spam) | Message protection | Detect abusive message patterns and repeated content. |
| [`@foxsecura/anti-nuke`](https://github.com/FoxSecura/Anti-Nuke) | Guild integrity | Detect destructive administrative actions from audit-log events. |
| [`@foxsecura/automod`](https://github.com/FoxSecura/Automod) | Native AutoMod | Configure and synchronize Discord server-side moderation rules. |

Each repository owns one security category while following the same package structure and integration contract.

## Category scope

Anti-Nuke processes normalized audit-log mutation events and correlates destructive actions by executor over configurable time windows.

It does not inspect member-join raids, message spam, or configure Discord native AutoMod rules.

## Included modules

| Module | Detects |
| --- | --- |
| `channel-delete-wave` | Rapid channel deletions by one executor. |
| `role-delete-wave` | Rapid role deletions by one executor. |
| `member-ban-wave` | Mass bans. |
| `member-kick-wave` | Mass kicks. |
| `webhook-mutation-wave` | Rapid webhook creation, updates, or deletion. |
| `destructive-action-wave` | Mixed destructive actions across several categories. |
| `dangerous-permission-grant` | Newly granted administrative or destructive permissions. |

Every module can be enabled, disabled, configured, replaced, or combined with project-specific modules.

## Shared package contract

- framework-independent core contracts;
- independent and composable modules;
- configurable default presets;
- Discord.js v14 adapter;
- explicit `start()` and `stop()` lifecycle;
- structured, serializable incidents;
- project-level ignore lists;
- no required database, command framework, logger, or environment loader;
- no automatic sanctions.

## Architecture

```text
src/
├── core/                 # Framework-independent contracts and orchestration
├── modules/              # Independent modules for this security category
├── presets/              # Ready-to-use module collections
├── adapters/
│   └── discordjs/        # Discord.js v14 integration
└── index.ts              # Public package exports
```

## Installation

```bash
npm install @foxsecura/anti-nuke discord.js
```

Before npm publication:

```bash
npm install github:FoxSecura/Anti-Nuke
```

## Quick start

The bot needs the **View Audit Log** permission and the `GuildModeration` gateway intent.

```ts
import { Client, GatewayIntentBits } from "discord.js";
import { DiscordJsAntiNuke } from "@foxsecura/anti-nuke/discordjs";
import { createDefaultAntiNukePreset } from "@foxsecura/anti-nuke/presets";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildModeration,
  ],
});

const antiNuke = new DiscordJsAntiNuke(client, {
  modules: createDefaultAntiNukePreset(),
  onIncident: async (incident) => {
    await securityBus.publish(incident);
  },
});

antiNuke.start();
await client.login(process.env.DISCORD_TOKEN);
```

Call `antiNuke.stop()` during shutdown, hot reload, or plugin unload.

## Framework-independent usage

```ts
import { AntiNukeEngine } from "@foxsecura/anti-nuke/core";
import { createDefaultAntiNukePreset } from "@foxsecura/anti-nuke/presets";

const engine = new AntiNukeEngine({
  modules: createDefaultAntiNukePreset(),
  onIncident: (incident) => securityBus.publish(incident),
});

await engine.handle(normalizedGuildMutationEvent);
```

Projects using another Discord library only need to map their audit-log events to the public core contracts.

## Public entry points

| Entry point | Purpose |
| --- | --- |
| `@foxsecura/anti-nuke` | Main exports and package alias. |
| `@foxsecura/anti-nuke/core` | Engine, events, incidents, and public contracts. |
| `@foxsecura/anti-nuke/modules` | Individual guild-integrity modules. |
| `@foxsecura/anti-nuke/presets` | Ready-to-use module collections. |
| `@foxsecura/anti-nuke/discordjs` | Discord.js audit-log integration and lifecycle. |

## Consuming bot responsibilities

The consuming bot decides how to:

- revoke or restrict an executor's access;
- freeze risky mutations or enter lockdown;
- preserve evidence and coordinate recovery;
- maintain allowlists for trusted administrators and integrations;
- coordinate Anti-Nuke with Anti-Raid, Anti-Spam, and Automod;
- apply permissions, approval rules, and operational safeguards.

## Safety model

Anti-Nuke only detects and reports. It does not automatically ban executors, remove roles, recreate resources, or change guild permissions.

Audit-log attribution must be validated before enforcement. Recommended actions are advisory and must pass the consuming bot's hierarchy, allowlists, cooldowns, and approval policy.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm pack --dry-run
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [FoxSecura package standard](docs/PACKAGE_STANDARD.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Support](SUPPORT.md)

## License

Released under the [MIT License](LICENSE).
