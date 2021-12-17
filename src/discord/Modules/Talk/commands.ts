import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction } from "discord.js"
import {Command} from "../../Helpers"

const command: Command = {

  data: new SlashCommandBuilder().setName('wawaras').setDescription("Es el wawaras!"),

  action: async (interaction: Interaction) => {
    if(interaction.isCommand()){
      await interaction.reply("Es el wawaras!")
      return
    }
  }
}

export const commands = [command]