import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import {Command} from './../../Helpers'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();


const BASE_XP = 25
const XP_RATIO = 1.7 // server s
const XP_SQRT = 1.45

//const MAX_LENGTH = 50 // + MSG = + XP
//const MAX_XP = 6

const nivel: Command = {
  data: new SlashCommandBuilder().setName('nivel')
    .setDescription("Tu nivel, coins y experiencia."),
  action: async (interaction: CommandInteraction,) => {
    const guild = interaction.guild
    if(!guild || !interaction.inGuild()){
      await interaction.reply("No puedo hacer eso sin un servidor :(")
      return
    }


    const levelData = await prisma.levels.findFirst({
      where: {
        guild: guild.id,
        uid: interaction.user.id,
      }
    })

    if(!levelData){
      interaction.reply("No tienes nivel en este servidor!")
      return
    }

    const current_xp = Math.floor(levelData.xp / XP_RATIO) - (BASE_XP * Math.pow(levelData.level, XP_SQRT))
    const target_xp = Math.floor((BASE_XP * Math.pow(levelData.level+1, XP_SQRT)) - BASE_XP * Math.pow(levelData.level, XP_SQRT))
    const next_level = Math.floor(current_xp * 100 / target_xp)

    const embed = new MessageEmbed()
    embed.setAuthor(`${interaction.user.username} en ${guild.name}`)
    embed.setThumbnail(interaction.user.displayAvatarURL())
    embed.addField(`Nivel ${levelData.level}`, `${next_level}% para nivel ${levelData.level+1}`, true)
    embed.addField("Puntos", String(levelData.points), true)

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

    let page = interaction.options.getInteger('page') ? interaction.options.getInteger('page') as number: 1 

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

    if(top.length === 0) {
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
          level: level.level,
          points: level.points
        }
      })
    )

    const embed = new MessageEmbed()
      .setColor('#c48888')
      .setTitle(`Top de usuarios con mas XP`)
    
    const imageUrl = guild.iconURL()
    if(imageUrl)
      embed.setThumbnail(imageUrl)

    member_data.forEach((member, index) => {
      let rindex = (page - 1) * 10 + (index + 1)
      const current_xp = Math.floor(member.xp / XP_RATIO) - (BASE_XP * Math.pow(member.level, XP_SQRT))
      const target_xp = Math.floor((BASE_XP * Math.pow(member.level+1, XP_SQRT)) - BASE_XP * Math.pow(member.level, XP_SQRT))
      const next_level = Math.floor(current_xp * 100 / target_xp)

      embed.addField(`${rindex}. ${member.name}`, `Nivel ${member.level} - ${next_level}% - ${member.points} puntos`, false)
    })
    await interaction.reply({embeds: [embed]})
  }
}

const tienda : Command = {
  data: new SlashCommandBuilder().setName('tienda')
    .setDescription("Tienda para canjear puntos."),
  action: async (interaction: CommandInteraction) => {
    const guild = interaction.guild
    if(!guild || !interaction.inGuild()){
      await interaction.reply("No puedo hacer eso sin un servidor :(")
      return
    }

    const items = await prisma.shops.findMany({
      where: {
        guild: guild.id
      }
    })

    if(!items){
      const embed = new MessageEmbed().setTitle("Tienda").setDescription("No hay tiendas en este servidor!")
      interaction.reply({embeds: [embed]})
      return
    }

    const embed = new MessageEmbed().setTitle("Tienda").setDescription(`Recompensas disponibles de ${guild.name}`).setColor('#c48888')

    items.forEach((item, index) => {
      embed.addField(`**${index+1}.** ${item.name}`, `Puntos: ${item.price}`)
    })

    interaction.reply({embeds: [embed]})
  }
}

const comprar : Command = {
  data: new SlashCommandBuilder()
    .setName('comprar')
    .setDescription("Comprar un item de la tienda").
    addIntegerOption(option => 
      option.setName("item")
      .setDescription("Indice del item a comprar")
    )
,
  action: async (interaction: CommandInteraction) => {
    const guild = interaction.guild
    if(!guild || !interaction.inGuild()){
      await interaction.reply("No puedo hacer eso sin un servidor :(")
      return
    }

    let item_id = interaction.options.getInteger('item')
    if(!item_id){
      await interaction.reply("No se especificó el ID del item.")
      return
    }
    item_id -= 1

    const items = await prisma.shops.findMany({
      where: {
        guild: guild.id
      }
    })

    if(!items){
      await interaction.reply("No hay tienda en este servidor!")
      return
    }

    if (items.length <= item_id) {
      await interaction.reply("No existe el item con ese ID.")
      return
    }
    const item = items[item_id]

    const user_level = await prisma.levels.findFirst({
      where: {
        guild: guild.id,
        uid: interaction.user.id
      }
    })

    if(!user_level){
      await interaction.reply("No tienes nivel en este servidor!")
      return
    }

    if(user_level.points < item.price){
      await interaction.reply("No tienes suficientes puntos!")
      return
    }

    const channel = guild.channels.cache.get(item.channel)
    if(!channel){
      await interaction.reply("No se encontró el canal de la tienda!, informar a un administrador.")
      return
    }
    if(!channel.isText()) return

    if(item.type === 0) {
      await channel.send(`${interaction.member.user.username} ha comprado el item ${item.name}!`)
    } else {
      if(!guild.me) return await interaction.reply("Curioso, no existo.")
      if(!guild.me.permissions.has('MANAGE_ROLES')){
        await interaction.reply("No tengo permisos para editar roles!")
        return
      }

      const role = guild.roles.cache.get(item.role)
      if(!role){
        await interaction.reply("No se encontró el rol, informar a un administrador.")
        return
      }

      const member = guild.members.cache.get(interaction.user.id)
      if(!member) return

      await member.roles.add(role)
      await channel.send(`${interaction.member.user.username} ha comprado el item ${item.name}!`)
    }

    await prisma.levels.updateMany({
      where: {
        guild: guild.id,
        uid: interaction.user.id
      },
      data: {
        points: user_level.points - item.price
      }
    })

    await interaction.reply("Compra realizada!")

  }
}


export const commands = [top, nivel, tienda, comprar]