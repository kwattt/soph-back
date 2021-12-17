// Gracias discord por obligarnos a utilizar slash commands!
import {SlashCommandBuilder} from '@discordjs/builders'
import { Interaction } from 'discord.js';

export default interface Command {
  data: SlashCommandBuilder
  action: (interaction : Interaction) => any
}