import {Event} from './../../Helpers'
import { PrismaClient } from '@prisma/client'
import { MessageEmbed, TextChannel } from 'discord.js'

import {youtube, getPlaylist, getLastVideo} from '../../../middleware/youtube'

const prisma = new PrismaClient()

let current_index = 0

const checker : Event = {
  name: "ready",
  once: true,
  action: async (client) => {

    const checkYoutube = async () => {
      // 30 vids por minuto y vamos rotando.
      console.log("check vids, index", current_index)

      const vids = await prisma.socials.findMany({
        where: {
          platform : 'youtube',
          NOT: {
            channel: {equals: "0"}
          }
        },
        take: 10,
        skip: current_index
      })

      if(vids.length >= 10){
        current_index += 10
      } else current_index = 0


      for(const vid of vids){
        const channel = client.channels.cache.get(vid.channel) as TextChannel
        if(typeof channel.send !== 'function') return

        const playlistData = await getPlaylist(vid.name)
        if(playlistData && playlistData.playlist_id){
          const lastVideo = await getLastVideo(playlistData.playlist_id)
          if(lastVideo && lastVideo.last_id){
            if(vid.last_update !== lastVideo.last_id){
              
              const embed = new MessageEmbed()
                .setTitle(`Nuevo video de ${playlistData.name}`)
                .setURL(`https://www.youtube.com/watch?v=${lastVideo.last_id}`)
                .setFooter(`https://www.youtube.com/watch?v=${lastVideo.last_id}`)

              if(lastVideo.descrip)
                embed.setDescription(lastVideo.descrip.substring(0, 300))

              if(playlistData.profile_image_url)
                embed.setThumbnail(playlistData.profile_image_url)

              if(lastVideo.thumbnail)
                embed.setImage(lastVideo.thumbnail)

              channel.send({embeds: [embed]})

              await prisma.socials.update({
                where: {
                  id: vid.id
                },
                data: {
                  last_update: lastVideo.last_id
                }
              })

            }
          }
        }
      }

    }

    setInterval(checkYoutube, 60000) // cada minuto
  }
}

export const events = [checker]
