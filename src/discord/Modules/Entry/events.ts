import { GuildMember } from 'discord.js'
import {Event} from './../../Helpers'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();


const leave: Event = {
  name: 'guildMemberRemove',
  action: async (client, member : GuildMember) => {
    if(!member.guild) return
    
    const channel = await prisma.guilds.findUnique({
      where: {
        guild: member.guild.id
      },
      select: {
        welcome: true
      }
    })

    if(!channel) return
    if(channel.welcome === '0') return

    const channel_ds = member.guild.channels.cache.get(channel.welcome)
    if(!channel_ds) return
    if(!channel_ds.isText()) return


    const welcome = await prisma.welcomes.findMany({
      where: {
        guild: member.guild.id,
        type: 1
      },
    })
    if(welcome.length === 0) return

    const welcome_response = welcome[Math.floor(Math.random() * welcome.length)].msg
    await channel_ds.send(welcome_response.replace(/\{\}/g, `<@${member.id}>`))
  }
}

const join: Event = {
  name: 'guildMemberAdd',
  action: async (client, member : GuildMember) => {
    if(!member.guild) return
    
    const channel = await prisma.guilds.findUnique({
      where: {
        guild: member.guild.id
      },
      select: {
        welcome: true
      }
    })

    if(!channel) return
    if(channel.welcome === '0') return

    const channel_ds = member.guild.channels.cache.get(channel.welcome)
    if(!channel_ds) return
    if(!channel_ds.isText()) return

    const welcome = await prisma.welcomes.findMany({
      where: {
        guild: member.guild.id,
        type: 0
      },
    })
    if(welcome.length === 0) return

    const welcome_response = welcome[Math.floor(Math.random() * welcome.length)].msg
    await channel_ds.send(welcome_response.replace(/\{\}/g, `<@${member.id}>`))
  }
}

export const events = [join, leave]