import {Event} from './../../Helpers'
import {Collection, Message, User} from 'discord.js'


import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


// dejar de escribir en 2 idiomas comentarios, saludos.

const BASE_XP = 25 // base xp, can be lower or higher 
const XP_RATIO = 1.7 // server base * multiplicador de servidor
const XP_SQRT = 1.45 // sqrt curve for xp

const MAX_LENGTH = 50 // + MSG = + XP
const MAX_XP = 6 // max xp por mensaje

var recordatorios: Collection<string, User> = new Collection()

const onUserJoinVoice : Event = {
  name: 'voiceStateUpdate',
  action: async (client, oldState, newState) => {
    // check guild levels enabled 
    // add to xp_detect iter
  }
}

const levelVoice : Event = {
  name: 'ready',
  once: true,
  action: async (client) => {
    const voiceUsersLoop = async () => {

      // check users in xp iter
      client.guilds.cache.forEach(async guildData => {

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

        guildData.channels.cache.forEach(async channel => {
          if(channel.type === 'GUILD_VOICE'){
            let active_members = channel.members

            let total_members = 0

            for(const [memberId, member] of active_members){
              if(!member.user.bot)
                total_members+=1

            }

            if(total_members > 1){
              for(const [memberId, member] of active_members){
                if(!member.user.bot)
                  continue

                  const userData = await prisma.levels.findFirst({
                    where: {
                      guild: guildData.id,
                      uid: member.user.id,
                    }
                  })
              
                  if(!userData){
                    await prisma.levels.create({
                      data: {
                        guild: guildData.id,
                        uid: member.user.id,
                        xp: 0,
                        level: 0,
                        points: 0,
                        nextcoin: 0,
                        cd: 0
                      }
                    })
                    return
                  }

                  let newLevel = userData.level
                  let newPoints = userData.points


                  const newxp = 1
                  const txp = userData.xp + newxp * guildInfo.levels
                  const isNewLevel = ((txp/XP_RATIO) > BASE_XP * Math.pow(userData.level+1, XP_SQRT))
              
                  if(isNewLevel)
                    newLevel = userData.level + 1
              
                  // points? 
              
                  let coin_xp = userData.nextcoin
                  coin_xp += Math.floor(newxp * guildInfo.levels * 1.2)
              
                  let next_coin_xp = userData.level % 20 // las coins se resetean cada 20 niveles
                  next_coin_xp = BASE_XP * Math.pow(next_coin_xp+5, XP_SQRT) // la xp que pagas es de 5 al 25 en realidad.
              
                  if(coin_xp >= next_coin_xp){
                    coin_xp = 0
                    newPoints += 1
                  }
              
                  await prisma.levels.update({
                    where: {
                      id: userData.id
                    },
                    data: {
                      xp: Math.floor(txp),
                      points: newPoints,
                      nextcoin: coin_xp,
                      level: newLevel
                    }
                  })
              }

            }


          }
        })
      })

    }

    setInterval(voiceUsersLoop, 480000) // cada 4min
  }
}

const levelMessage : Event = {
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
          nextcoin: 0,
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
    if(newxp === 0) return

    const txp = userData.xp + newxp * guildInfo.levels
    const isNewLevel = ((txp/XP_RATIO) > BASE_XP * Math.pow(userData.level+1, XP_SQRT))

    if(isNewLevel)
      newLevel = userData.level + 1

    // points? 

    let coin_xp = userData.nextcoin
    coin_xp += Math.floor(newxp * guildInfo.levels * 1.2)

    let next_coin_xp = userData.level % 20 // las coins se resetean cada 20 niveles
    next_coin_xp = BASE_XP * Math.pow(next_coin_xp+5, XP_SQRT) // la xp que pagas es de 5 al 25 en realidad.

    if(coin_xp >= next_coin_xp){
      coin_xp = 0
      newPoints += 1
    }

    await prisma.levels.update({
      where: {
        id: userData.id
      },
      data: {
        xp: Math.floor(txp),
        cd: ctime+10,
        points: newPoints,
        nextcoin: coin_xp,
        level: newLevel
      }
    })

  }
}

export const events = [levelMessage]