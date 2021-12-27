import {Event} from './../../Helpers'
import { PrismaClient } from '@prisma/client'
import { MessageEmbed, TextChannel } from 'discord.js'

import twitch from './twitch'

const prisma = new PrismaClient()

let current_index = 0

const checker : Event = {
  name: "ready",
  once: true,
  action: async (client) => {

    const checkStreams = async () => {
      // 30 streams por minuto y vamos rotando.
      console.log("stream check, index: " + current_index)

      const streams = await prisma.socials.findMany({
        where: {
          platform : 'twitch',
          NOT: {
            channel: {equals: "0"}
          }
        },
        take: 35,
        skip: current_index
      })

      if(streams.length >= 30){
        current_index += 30
      } else current_index = 0

      for(const stream of streams){
        const stream_data = await twitch.getStreams({channel: stream.name})
        const user_data = stream_data.data[0]

        const channel = client.channels.cache.get(stream.channel) as TextChannel
        if(typeof channel.send !== 'function') return

        if(user_data && stream.live === 0){
          // is online

          await prisma.socials.update({
            where: {
              id: stream.id
            },
            data: {
              live: 1
            }
          })

          if(stream.type !== 0){
            channel.send(stream.type === 1 ? "@here" : "@everyone")
          }

          const user_info = await twitch.searchChannels({query: stream.name})
          const user_vals = user_info.data[0]
          if(!user_vals) {
            const embed = new MessageEmbed()
            .setTitle(`${stream.name} está en vivo!`)
            .setURL(`https://twitch.tv/${user_data.user_name}`)
            .setThumbnail(user_data.getThumbnailUrl())
            .setDescription(`**${user_data.viewer_count}** viewers\n- ${user_data.title}`)

            channel.send({embeds: [embed]})
            continue
          }

          const embed = new MessageEmbed()
            .setAuthor(user_vals.display_name, user_vals.thumbnail_url, `https://twitch.tv/${user_data.user_name}`)
            .setTitle(`${stream.name} está en vivo!`)
            .setURL(`https://twitch.tv/${user_data.user_name}`)
            .setThumbnail(user_data.getThumbnailUrl())
            .setDescription(`**${user_data.viewer_count}** viewers\n- ${user_data.title}`)

            channel.send({embeds: [embed]})

        } else if(!user_data && stream.live === 1) {
          // is offline

          await prisma.socials.update({
            where: {
              id: stream.id
            },
            data: {
              live: 0
            }
          })

          channel.send(`${stream.name} ya no está en vivo :(`)

        }

      }

    }


    setInterval(checkStreams, 60000) // cada minuto
  }
}


export const events = [checker]