import {Command} from './../../Helpers'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'

import axios from 'axios'

const Urban : Command = {
  data: new SlashCommandBuilder()
    .setName('urban')
    .setDescription('Busca una chingadera en UrbanDictionary')
    .addStringOption(option => 
      option.setName('palabra').setDescription('Palabra a buscar').setRequired(true)),
  action: async (interaction: CommandInteraction) => {
    const palabra = interaction.options.getString('palabra')

    try {
      const response : any = await axios.get(`http://api.urbandictionary.com/v0/define?term=${palabra}`)

      if(response.data.list){
        if(response.data.list.length > 0) 
        {
          const first_result = response.data.list[0]
          const embed = new MessageEmbed()
            .setTitle(`${first_result.word}`)
            .setURL(first_result ? first_result.permalink : 'https://www.urbandictionary.com/')
            .setDescription(`**${first_result.definition}**`)
            .setFooter(`Escrita por ${first_result.author}`)
            .setColor('#40cf8b')
          try { // hacer error handling como se debe.
            interaction.reply({embeds: [embed]})
          }
          catch (err) {
            interaction.reply(`Hubo un error al procesar ${palabra} :(`)
          }
        }
        else interaction.reply('Palabra no encontrada :(')
      }
    } catch (error) {
      console.log(error)
      if(axios.isAxiosError(error)){
        if(error.response){
          if(error.response.status == 404){
            interaction.reply('Palabra no encontrada :(')
          }
          else interaction.reply(`No pude encontrar esta palabra :( (fetch error) ${error.response.status}`)
        }
        else interaction.reply('No pude encontrar esta palabra :( (fetch error)')

      } else {
        interaction.reply('No pude encontrar esta palabra :( (fetch error)')
      }
    }
  }
}

export const commands = [Urban]