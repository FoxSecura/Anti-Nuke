# FoxSecura Anti-Nuke

[![CI](https://img.shields.io/github/actions/workflow/status/FoxSecura/Anti-Nuke/ci.yml?branch=main&style=plastic&logo=githubactions&logoColor=white&label=CI)](https://github.com/FoxSecura/Anti-Nuke/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/FoxSecura/Anti-Nuke/codeql.yml?branch=main&style=plastic&logo=github&logoColor=white&label=CodeQL)](https://github.com/FoxSecura/Anti-Nuke/actions/workflows/codeql.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=plastic&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?style=plastic&logo=discord&logoColor=white)](https://discord.js.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=plastic)](LICENSE)

A modular, framework-agnostic anti-nuke detection toolkit for Discord bots. It consumes normalized guild mutation events, runs independent protection modules, and returns structured incidents. Your application remains responsible for enforcement.

## Included protections

| Module | Detects |
| --- | --- |
| `channel-delete-wave` | Rapid channel deletions by one executor |
| `role-delete-wave` | Rapid role deletions by one executor |
| `member-ban-wave` | Mass bans |
| `member-kick-wave` | Mass kicks |
| `webhook-mutation-wave` | Rapid webhook creation, updates, or deletion |
| `destructive-action-wave` | Mixed destructive actions across several categories |
| `dangerous-permission-grant` | Newly granted administrative or destructive permissions |

## Architecture

- `core`: normalized events, incidents, engine, and window store
- `modules`: independent detectors with configurable thresholds
- `presets`: a ready-to-use default module collection
- `discordjs`: an adapter for Discord.js audit-log gateway events

The core has no database, environment loader, logger, command system, or moderation policy dependency.

## Install

```bash
npm install @foxsecura/anti-nuke discord.js
```

## Discord.js usage

```ts
import { Client, GatewayIntentBits } from "discord.js";
import { DiscordJsAntiNuke } from "@foxsecura/anti-nuke/discordjs";
import { createDefaultAntiNukePreset } from "@foxsecura/anti-nuke/presets";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration],
});

const antiNuke = new DiscordJsAntiNuke(client, {
  modules: createDefaultAntiNukePreset(),
  onIncident: async (incident) => {
    console.warn(incident);
    // Decide here whether to revoke access, freeze mutations, or lock down.
  },
});

antiNuke.start();
```

The bot needs the **View Audit Log** permission and the `GuildModeration` gateway intent to receive audit-log entry events.

## Framework-agnostic usage

```ts
import { AntiNukeEngine } from "@foxsecura/anti-nuke/core";
import { createDefaultAntiNukePreset } from "@foxsecura/anti-nuke/presets";

const engine = new AntiNukeEngine({
  modules: createDefaultAntiNukePreset(),
  onIncident: async (incident) => securityQueue.publish(incident),
});

await engine.handle(normalizedMutationEvent);
```

## Safety model

Anti-Nuke detects and reports. It does **not** automatically ban users, delete resources, remove roles, or change guild permissions. This separation makes the package reusable inside larger bots and prevents a detector from imposing an unsafe response policy.

Recommended actions are advisory. Validate audit-log attribution and apply your own allowlists before taking destructive action.

## Development

```bash
npm install
npm run check
npm test
npm run build
npm pack --dry-run
```

## License

MIT
