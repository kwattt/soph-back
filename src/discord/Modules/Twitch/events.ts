import {Event} from './../../Helpers'
import { PrismaClient } from '@prisma/client'
import { MessageEmbed } from 'discord.js'

import twitch from './twitch'

const prisma = new PrismaClient()

let current_index = 0

const checker : Event = {
  name: "ready",
  once: true,
  action: async (client) => {

    const checkStreams = async () => {
      // 30 streams por minuto y vamos rotando.

      const streams = await prisma.socials.findMany({
        where: {
          platform : 'twitch',
          NOT: {
            channel: {equals: "0"}
          }
        },
        take: 25,
        skip: current_index
      })

      if(streams.length >= 25){
        current_index += 25
      } else current_index = 0

      for(const stream of streams){

        const channel = client.channels.cache.get(stream.channel)
        if(!channel) continue
        if(!channel.isText()) continue

        try {

        const stream_data = await twitch.getStreams({channel: stream.name})
        const user_data = stream_data.data[0]


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

          const user_info = await twitch.getUsers(user_data.user_id)
          const user_vals = user_info.data[0]
          if(!user_vals || user_vals.display_name !== user_data.user_name) {
            const embed = new MessageEmbed()
            .setTitle(`${user_data.title}`)
            .setURL(`${user_data.title}`) 
            .setColor(0xb40789)
            .setImage(user_data.getThumbnailUrl())
            .setDescription(`**${user_data.viewer_count}** viewers\n- ${stream.name}`)
            .setFooter(`https://twitch.tv/${user_data.user_name}`)

            channel.send({embeds: [embed]})
            continue
          }

          const embed = new MessageEmbed()
            .setAuthor(user_vals.display_name, user_vals.profile_image_url, `https://twitch.tv/${user_data.user_name}`)
            .setTitle(`${user_data.title}`)
            .setURL(`https://twitch.tv/${user_data.user_name}`)
            .setImage(user_data.getThumbnailUrl())
            .setThumbnail(user_vals.profile_image_url)
            .setDescription(`**${user_data.viewer_count}** viewers\n- ${stream.name}`)
            .setFooter(`https://twitch.tv/${user_data.user_name}`)

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

        } catch(e) {
          console.log("[TWITCH]ERROR CON:", stream.name, e)
        }

      }

    }


    setInterval(checkStreams, 60000) // cada minuto
  }
}


export const events = [checker]