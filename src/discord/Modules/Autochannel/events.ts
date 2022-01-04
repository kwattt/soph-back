import { VoiceState } from "discord.js"
import { Event } from "../../Helpers"

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


const autochannel : Event = {
  name: 'voiceStateUpdate',
  action: async (client, oldState : VoiceState, newState: VoiceState) => {

    let guildData = oldState.guild
    if(!guildData) return 

    // CHECK PERMISSIONS
    if(!guildData.me) return

    
    if(!guildData.me.permissions.has('MANAGE_CHANNELS')) return

    if(oldState.channelId === newState.channelId) return

    if(oldState.channelId !== null && newState.channelId === null){
      // left channel
      // hide old

      const oldData = await prisma.autochannels.findMany({
        where: {
          guild: guildData.id,
          origenchannel: oldState.channelId
        }
      })

      if(oldData.length === 0) return
      if(!oldState.channel) return
      if(!oldState.member) return

      const channel = guildData.channels.cache.get(oldData[0].targetchannel)
      if(!channel) return
      if(channel.isThread()) return

      channel.permissionOverwrites.create(oldState.member.id, {
        VIEW_CHANNEL: false,
      })


    }
    else if(oldState.channelId === null && newState.channelId !== null){
      // joined channel
      // show new

      const newData = await prisma.autochannels.findMany({
        where: {
          guild: guildData.id,
          origenchannel: newState.channelId
        }
      })

      if(newData.length === 0) return
      if(!newState.channel) return
      if(!newState.member) return

      const channel = guildData.channels.cache.get(newData[0].targetchannel)
      if(!channel) return

      if(channel.isThread()) return

      channel.permissionOverwrites.create(newState.member.id, {
        VIEW_CHANNEL: true,
      })

    }
    else if(oldState.channelId !== null && newState.channelId !== null){
      // changed channel
      // hide old, show new

      const newData = await prisma.autochannels.findMany({
        where: {
          guild: guildData.id,
          origenchannel: newState.channelId
        }
      })
      const oldData = await prisma.autochannels.findMany({
        where: {
          guild: guildData.id,
          origenchannel: oldState.channelId
        }
      })

      if(oldData.length === 0) return
      if(!newState.channel) return
      if(!newState.member) return

      const oldchannel = guildData.channels.cache.get(oldData[0].targetchannel)
      if(!oldchannel) return
      if(oldchannel.isThread()) return

      oldchannel.permissionOverwrites.create(newState.member.id, {
        VIEW_CHANNEL: false,
      })


      if(newData.length === 0) return
      if(!newState.channel) return
      if(!newState.member) return

      const newchannel = guildData.channels.cache.get(newData[0].targetchannel)
      if(!newchannel) return
      if(newchannel.isThread()) return

      newchannel.permissionOverwrites.create(newState.member.id, {
        VIEW_CHANNEL: true,
      })

    }
  }
}

export const events = [autochannel]