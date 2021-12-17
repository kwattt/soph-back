// Gracias discord por obligarnos a utilizar slash commands!
import {SlashCommandBuilder} from '@discordjs/builders'
import { CommandInteraction } from 'discord.js';

export default interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
  action: (interaction : CommandInteraction) => any
}