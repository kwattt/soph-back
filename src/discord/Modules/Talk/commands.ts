import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction, MessageEmbed } from "discord.js"
import {Command} from "../../Helpers"
import messages from "./../../../routes/api/extra/messages.json"
const wait = require('util').promisify(setTimeout)

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

/*
const wawaras: Command = {
  data: new SlashCommandBuilder().setName('wawaras').setDescription("WAWARAS!"),

  action: async (interaction: Interaction) => {
    if(interaction.isCommand()){
      await interaction.reply({content: "Es el wawaras!", ephemeral: true})
      return
    }
  }
} */

const useless: Command = {
  data: new SlashCommandBuilder().setName('useless').setDescription("Algo completamente inútil"),
  action: async (interaction: CommandInteraction) => {
    if(interaction.isCommand()){
      await interaction.reply(messages.messages[Math.floor(Math.random() * messages.messages.length)])
      await wait(15000)
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
      await interaction.reply(`https://www.google.com/search?q=${encodeURIComponent(query)}`)
    else 
      await interaction.reply("No hay consulta! smh")
  }
}

const oraculo: Command = {
  data: new SlashCommandBuilder()
    .setName('oraculo')
    .setDescription("Algo que el oraculo dice, perturbador.")
    .addStringOption(option => 
      option.setName("babosada")
      .setDescription("La babosada que vas a preguntar.")
    ),
  action: async (interaction: CommandInteraction) => {
    const guild = interaction.guildId
    if(!guild || !interaction.inGuild()){
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

    let babosada = interaction.options.getString('babosada')
    if(!babosada){
      await interaction.reply(response)
      return 
    }

    const embed = new MessageEmbed()
      .setColor("#e87d7d")
      .setTitle(`${babosada}`)
      .setDescription(`**Oraculo:** ${response}`)
    interaction.reply({embeds: [embed]})

  }
}

const ddg: Command = {
  data: new SlashCommandBuilder()
            .setName('ddg')
            .setDescription("Busca en DuckDuckGo")
            .addStringOption(option => 
              option.setName('query')
              .setDescription("La consulta a buscar!")
              .setRequired(true)
            ),
  action: async (interaction: CommandInteraction) => {
    const query = interaction.options.getString('query')
    if(query)
      await interaction.reply(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`)
    else 
      await interaction.reply("No hay consulta! smh")
  }
}

const youtube: Command = {
  data: new SlashCommandBuilder()
            .setName('yt')
            .setDescription("Busca en Youtube")
            .addStringOption(option => 
              option.setName('query')
              .setDescription("La consulta a buscar!")
              .setRequired(true)
            ),
  action: async (interaction: CommandInteraction) => {
    const query = interaction.options.getString('query')
    if(query)
      await interaction.reply(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`)
    else 
      await interaction.reply("No hay consulta! smh")
  }
} 

const moneda: Command = {
  data: new SlashCommandBuilder()
            .setName('moneda')
            .setDescription("Tira una moneda"),
  action: async (interaction: CommandInteraction) => {
    const result = Math.floor(Math.random() * 2)
    if(result === 0)
      await interaction.reply("Ha salido cara!")
    else
      await interaction.reply("Ha salido cruz!")
  }
}

export const commands = [moneda, youtube, useless, google, ddg, oraculo]