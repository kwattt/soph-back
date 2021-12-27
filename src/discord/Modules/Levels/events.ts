import {Event} from './../../Helpers'
import {Message} from 'discord.js'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


const BASE_XP = 25
const XP_RATIO = 1.7 // server s
const XP_SQRT = 1.45

const MAX_LENGTH = 50 // + MSG = + XP
const MAX_XP = 6

const levelHandling : Event = {
  name: 'messageCreate',
  action: async (client, message : Message) => {
    if(message.author.bot) return

    const guildData = message.guild
    if(!guildData) return 

    const guildInfo = await prisma.guilds.findUnique({
      where: {
          guild: guildData.id,
      },
      select: {
        levels: true
      }
    })

    if(!guildInfo) return
    if(guildInfo.levels  <= 0.0) return 

    const excludeChannels = await prisma.levelchannels.findMany({
      where: {
        guild: guildData.id
      }
    })

    const channelArray = excludeChannels.map(channel => channel.channel)

    const currentChannel = message.channel
    if(!currentChannel) return 
    if(channelArray.includes(currentChannel.id)) return 

    const userData = await prisma.levels.findFirst({
      where: {
        guild: guildData.id,
        uid: message.author.id,
      }
    })

    if(!userData){
      await prisma.levels.create({
        data: {
          guild: guildData.id,
          uid: message.author.id,
          xp: 0,
          level: 0,
          points: 0,
          cd: 0
        }
      })
      return
    }

    var ctime = Math.round(+new Date()/1000)
    if (ctime < userData.cd) return

    let newLevel = userData.level
    let newPoints = userData.points

    let msglen = message.content.length

    const custom_emojis = message.content.match(/(<:\w*:\d*>)g/g)

    for(const __ in custom_emojis)
      msglen -= 7

    if(msglen < 7) return 

    let newxp = msglen < MAX_LENGTH ? Math.floor((msglen * MAX_XP)/MAX_LENGTH) : Math.floor(MAX_XP) 
    if(newxp === 0 && msglen > 4) newxp = 1

    const txp = userData.xp + newxp * guildInfo.levels
    const isNewLevel = ((txp/XP_RATIO) > BASE_XP * Math.pow(userData.level+1, XP_SQRT))

    if(isNewLevel){
      newLevel = userData.level + 1
      newPoints = userData.points + 1
    }

    await prisma.levels.update({
      where: {
        id: userData.id
      },
      data: {
        xp: txp,
        cd: ctime+10,
        points: newPoints,
        level: newLevel
      }
    })

  }
}


export const events = [levelHandling]