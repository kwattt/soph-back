import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import {Command} from './../../Helpers'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

const nivel: Command = {
  data: new SlashCommandBuilder().setName('nivel')
    .setDescription("Tu nivel, coins y experiencia."),
  action: async (interaction: CommandInteraction,) => {
    const guild = interaction.guild
    if(!guild || !interaction.inGuild()){
      await interaction.reply("No puedo hacer eso sin un servidor :(")
      return
    }


    const guildData = await prisma.levels.findFirst({
      where: {
        guild: guild.id,
        uid: interaction.user.id,
      }
    })

    if(!guildData){
      interaction.reply("No tienes nivel en este servidor!")
      return
    }

    const embed = new MessageEmbed()
      .setTitle(`${interaction.member.user.username} en ${guild.name}`)
      .setDescription(`**Nivel** ${guildData.level} | **XP** ${guildData.xp} | **Puntos** ${guildData.points} `)

    interaction.reply({embeds: [embed]})

  }
}

const top: Command = {
  data: new SlashCommandBuilder().setName('top').
    setDescription("Top de usuarios con mas XP").addIntegerOption(option =>
      option.setName("page").
      setDescription("Pagina a mostrar")
    ),
  action: async (interaction: CommandInteraction) => {
    const guild = interaction.guild
    if(!guild || !interaction.inGuild()){
      await interaction.reply("No puedo hacer eso sin un servidor :(")
      return
    }

    let page = interaction.options.getInteger('page') 
    if(!page || page < 1) page = 1

    const top = await prisma.levels.findMany({
      where: {
        guild: guild.id
      },
      select: {
        uid: true,
        points: true,
        xp: true,
        level: true
      },
      orderBy: [
        {level: "desc"},
        {xp: "desc"}
      ],
      take: 10,
      skip: (page - 1) * 10
    })

    if(!top) {
      interaction.reply("No existe este top!")
      return
    }

    const member_data = await Promise.all(
      top.map(async level => {
        let member = guild.members.cache.get(level.uid)
        if(!member){
          try {
            await guild.members.fetch(level.uid).then(res => {
              member = res
            })
          }
          catch (err) {
            // not found
          }
        }
        let nickname = member ? member.displayName : '~~ Gone :('
        return {
          name: nickname,
          xp: level.xp,
          level: level.level
        }
      })
    )

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`Top de usuarios con mas XP`)

    member_data.forEach((member, index) => {
      embed.addField(`${index}. ${member.name}`, `Nivel: ${member.level} | XP: ${member.xp}`)
    })
    await interaction.reply({embeds: [embed]})
  }
}

export const commands = [top, nivel]