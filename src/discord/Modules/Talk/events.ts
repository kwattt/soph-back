import {Event} from './../../Helpers'
import {Message} from 'discord.js'
import Client from '../../Client'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();

/*
  Posiblemente implementar un sistema de cache para evitar hacer
  consultas a la base de datos cada vez que se envía un mensaje. (Stalk)
*/

const reminderThing: Event = {
  name: 'messageCreate', 
  action: async (client: Client, message: Message) => {
    if(message.author.bot) return
    if(!message.guildId) return
    if(!message.content.startsWith('!')) return

    const reminder = await prisma.msgcustoms.findMany({
      where: {
        guild: message.guildId,
        name: message.content.substring(1)
      }
    })
    
    if(reminder.length === 0) return
    const reminder_response = reminder[0].message
    await message.reply(reminder_response.replace(/\{\}/g, `<@${message.author.id}>`))
  }
}

const stalkEvent: Event = {
  name: 'messageCreate',
  action: async (client: Client, message: Message) => {
    if(message.author.bot) return
    if(!message.guildId) return

    if(Math.round(Math.random() * 1000) !== 5) // 0.1%
      return

    const stalkRoles = await prisma.stalkroles.findMany({
      where: {
        guild: message.guildId
      },
      select: {
        role: true
      }
    }) 

    if(stalkRoles.length === 0) return

    const stalkMap = stalkRoles.map(role => role.role)
    const member = message.member

    // Eliminar roles basura (no existentes.)
    const guildRoles = message.guild?.roles.cache
    if(guildRoles){
      stalkRoles.forEach(async role => {
        if(!guildRoles.has(role.role)){
          await prisma.stalkroles.deleteMany({
            where: {
              guild: String(message.guildId),
              role: role.role
            }
          })
        }
      })
    }

    if(member?.roles.cache.some(role => stalkMap.includes(role.id))){
      const responses = await prisma.stalkmsgs.findMany({
        where: {
          guild: message.guildId
        },
        select: {
          msg: true
        }
      })
      if(responses.length === 0) return

      const selected_response = responses[Math.floor(Math.random() * responses.length)]
      await message.reply(selected_response.msg.replace(/\{\}/g, `<@${message.author.id}>`))
    }
  } 
}

export const events = [stalkEvent, reminderThing]