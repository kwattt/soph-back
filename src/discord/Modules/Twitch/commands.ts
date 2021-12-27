import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { Command } from './../../Helpers'

import twitch from './twitch'

const isLive : Command = {
  data: new SlashCommandBuilder()
    .setName('twitch')
    .setDescription("Checar si un streamer está en vivo")
    .addStringOption(option =>
      option.setName('streamer')
      .setDescription("Nombre del streamer")
      .setRequired(true)  
    ),
  action: async (interaction: CommandInteraction) => {
    const query = interaction.options.getString('streamer')
    if(!query) return interaction.reply("nao nao")

    const stream_data = await twitch.getStreams({channel: query})

    const first_user = stream_data.data[0]
    if(!first_user) return interaction.reply("Este usuario no está en vivo!")

    if(first_user.type === 'live')
    {
      const embed = new MessageEmbed()
        .setTitle(`${first_user.user_name} está en vivo!`)
        .setURL(`https://twitch.tv/${first_user.user_name}`)
        .setThumbnail(first_user.getThumbnailUrl())
        .setDescription(`**${first_user.viewer_count}** viewers\n- ${first_user.title}`)

      interaction.reply({embeds: [embed]})
    }

    else interaction.reply("Este usuario no está en vivo!")
    
  }
}

export const commands = [isLive]