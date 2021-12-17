import { SlashCommandBuilder } from "@discordjs/builders"
import { Interaction, CommandInteraction } from "discord.js"
import {Command} from "../../Helpers"
import messages from "./../../../routes/api/extra/messages.json"
const wait = require('util').promisify(setTimeout)

const wawaras: Command = {
  data: new SlashCommandBuilder().setName('wawaras').setDescription("WAWARAS!"),

  action: async (interaction: Interaction) => {
    if(interaction.isCommand()){
      await interaction.reply({content: "Es el wawaras!", ephemeral: true})
      return
    }
  }
}

const useless: Command = {
  data: new SlashCommandBuilder().setName('useless').setDescription("Algo completamente inútil"),
  action: async (interaction: CommandInteraction) => {
    if(interaction.isCommand()){
      await interaction.reply(messages.messages[Math.floor(Math.random() * messages.messages.length)])
      await wait(2500)
      await interaction.deleteReply()
    }
  }
}

const google: Command = {
  data: new SlashCommandBuilder()
            .setName('google')
            .setDescription("Busca en Google")
            .addStringOption(option => 
              option.setName('query')
              .setDescription("La consulta a buscar!")
              .setRequired(true)
            ),
  action: async (interaction: CommandInteraction) => {
    const query = interaction.options.getString('query')
    if(query)
      await interaction.reply(`https://www.google.com/search?q=${query}`)
    else 
      await interaction.reply("No hay consulta! smh")
  }
}

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

const oraculo: Command = {
  data: new SlashCommandBuilder()
    .setName('oraculo')
    .setDescription("Algo que el oraculo dice, perturbador."),
  action: async (interaction: CommandInteraction) => {
    const guild = interaction.guildId
    if(!guild){
      await interaction.reply("No puedo hacer eso sin un servidor :(")
      return
    }

    let oraculo = await prisma.oraculos.findMany({
      where: {
        guild: interaction.guildId
      }
    })

    if(oraculo.length === 0){
      await interaction.reply("No hay oraculo en este servidor :(")
      return
    }

    let response = oraculo.map(oraculo => oraculo.msg)[Math.floor(Math.random() * oraculo.length)]
    response = response.replace(/\{\}/g, `<@${interaction.user.id}>`)
    await interaction.reply(response)
  }
}

export const commands = [wawaras, useless, google, oraculo]