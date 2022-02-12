import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"
import {Command} from "./../../Helpers"

const Clima : Command = {
  data: new SlashCommandBuilder()
    .setName('clima')
    .setDescription('Busca el clima de una ciudad')
    .addStringOption(option =>
    option.setName('ciudad').setDescription('Ciudad a buscar').setRequired(true)
    ),
  action: async (interaction: CommandInteraction) => {
    interaction.reply('saludos')
  }
}