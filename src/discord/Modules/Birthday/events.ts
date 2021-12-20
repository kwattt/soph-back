import {Event} from './../../Helpers'

import { PrismaClient } from '@prisma/client'
import { TextChannel } from 'discord.js';
const prisma = new PrismaClient();

/* 
  Deberia eliminar la informacion una vez no se encuentre el mensaje o la guild?
*/

const birthday : Event = {
  name: 'ready',
  once: true,
  action: async (client) => {

    const birthdayInterval = async () => {
      const birthdayChannels = await prisma.guilds.findMany({
        select: {
          birthday: true,
          bdaymsg: true,
          bdayutc: true,
          guild: true
        },
        where: {
          NOT: {
            birthday: {equals: '0'}
          }
        }
      })

      for(const guild of birthdayChannels){
        let utcHour = new Date()
        utcHour.setHours(utcHour.getHours() + guild.bdayutc )

        if(utcHour.getUTCHours() === 0 && utcHour.getUTCMinutes() === 0){
          const guildData = client.guilds.cache.get(guild.guild)
          if(!guildData) 
            continue
  
          const channel = guildData.channels.cache.get(guild.birthday) as TextChannel
          if(!channel){
            await prisma.guilds.update({
              where: {
                guild: guild.guild
              },
              data: {
                birthday: '0'
              }
            })
            continue
          }
          if(typeof channel.send !== 'function'){
            await prisma.guilds.update({
              where: {
                guild: guild.guild
              },
              data: {
                birthday: '0'
              }
            })
            continue
          }  

          // check birthdays.
          const birthdayusers = await prisma.users.findMany({
            where: {
              month: utcHour.getUTCMonth()+1,
              day: utcHour.getUTCDate(),
            },
            select: {
              uid: true
            }
          })

          let names: string[] = []
          for(const user of birthdayusers){
            const member = await guildData.members.fetch(user.uid)
            if(!member)
              continue
            names = [...names, member.displayName]
          }

          if(names.length === 0)
            continue
  
          await channel.send(guild.bdaymsg.replace(/\{\}/g, names.join(' ')))
        }
      }
    }

    setInterval(birthdayInterval, 60000);
  }
}

export const events = [birthday]