import {Event} from './../../Helpers'

import { PrismaClient } from '@prisma/client'

import {  SnowflakeUtil } from 'discord.js'

const prisma = new PrismaClient()

const purge : Event = {
  name: 'ready',
  once: true,
  action: async (client) => {
    const purgeCheck = async () => {
      const activeGuilds = await prisma.guilds.findMany()

      for(const guild of activeGuilds){
        const purgeData = await prisma.purges.findMany({
          where: {
            guild: guild.guild
          }
        })

        if(purgeData.length === 0) continue
        const guildData = client.guilds.cache.get(guild.guild)
        if(!guildData) continue

        for(const purge of purgeData){
          let utcHour = new Date()
          utcHour.setHours(utcHour.getHours() + purge.utc)
          
          if(utcHour.getUTCHours() !== purge.hour || utcHour.getUTCMinutes() !== purge.minute) continue

          const channelData = guildData.channels.cache.get(purge.channel)
          if(!channelData) continue
          if(!channelData.isText()) continue

          utcHour.setHours(utcHour.getHours() - 24)
          const dateAfter = SnowflakeUtil.generate(utcHour)

          let fetched
          do {
            fetched = await channelData.messages.fetch({
              limit: 100,
              after: dateAfter
            })
            await channelData.bulkDelete(fetched, true);
          }
          while (fetched.size >= 2)

          channelData.send("El canal ha sido limpiado")
          channelData.send("La limpieza ocurre todos los días a las " + purge.hour + ":" + purge.minute + " con UTC"+ purge.utc + ".") 
        }

      }

    }
    setInterval(purgeCheck, 60000)
  }
}

export const events = [purge]
