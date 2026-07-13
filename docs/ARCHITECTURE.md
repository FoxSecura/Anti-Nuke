# Architecture

Anti-Nuke follows the shared FoxSecura package structure: core, modules, presets, adapters, and public exports.

## Event flow

1. An adapter converts a provider event into `GuildMutationEvent`.
2. `AntiNukeEngine` evaluates enabled modules.
3. Modules maintain only the minimum in-memory state needed for their detection window.
4. Incidents are sent to the consuming project's callback.
5. The consuming project decides whether and how to enforce a response.

## Audit-log attribution

The Discord.js adapter consumes `GuildAuditLogEntryCreate`. This avoids racing a second audit-log fetch after every guild event. Events without an executor are not used by executor-rate modules.

## Composition

Anti-Nuke can run beside Anti-Raid and Anti-Spam. Each package owns its detector state while a host bot can route all incidents into one logging, persistence, policy, and response layer.
