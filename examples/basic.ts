import { DiscordJsAntiNuke } from "@foxsecura/anti-nuke/discordjs";
import { createDefaultAntiNukePreset } from "@foxsecura/anti-nuke/presets";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
  ],
});

const antiNuke = new DiscordJsAntiNuke(client, {
  modules: createDefaultAntiNukePreset(),
  enforcement: {
    enabled: true,
    removeDangerousRoles: true,
    timeout: {
      enabled: true,
      durationMs: 60 * 60 * 1000,
      minimumSeverity: "high",
    },
    ban: {
      enabled: false,
    },
  },
  onIncident: (incident) => {
    console.warn(`[FoxSecura Anti-Nuke] ${incident.summary}`);
  },
});

antiNuke.start();
await client.login(process.env.DISCORD_TOKEN);
