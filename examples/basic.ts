import { DiscordJsAntiNuke } from "@foxsecura/anti-nuke/discordjs";
import { createDefaultAntiNukePreset } from "@foxsecura/anti-nuke/presets";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildModeration],
});

const antiNuke = new DiscordJsAntiNuke(client, {
  modules: createDefaultAntiNukePreset(),
  onIncident: async (incident) => {
    console.warn("Anti-nuke incident", incident);
    // Your bot decides whether to revoke access, freeze changes, or lock down the guild.
  },
});

antiNuke.start();
await client.login(process.env.DISCORD_TOKEN);
