import {Event} from './../../Helpers'
import { PrismaClient } from '@prisma/client'
import { MessageEmbed } from 'discord.js'

import axios, {AxiosError} from 'axios'
const { parse } = require('rss-to-json');

const getImageFromProfile = async (profile : string) => {
  let image = undefined
  try {
    const rss = await parse(`https://nitter.net/${profile}/rss`)
    if(rss && rss.image)
      return rss.image
  }
  catch {
    return undefined
  }
  return image
}

const prisma = new PrismaClient()

let current_index = 0
var regexImage = new RegExp(`<img [^>]*src="([^"]+)"[^>]*>`, "g");
var regexVideo = new RegExp(`<video [^>]*poster="([^"]+)"[^>]*>`, "g");

const checker : Event = {
  name: "ready",
  once: true,
  action: async (client) => {

    const checkTwitter = async () => {
      // 30 vids por minuto y vamos rotando.

      const profiles = await prisma.socials.findMany({
        where: {
          platform : 'twitter',
          NOT: {
            channel: {equals: "0"}
          }
        },
        take: 20,
        skip: current_index
      })

      if(profiles.length >= 20){
        current_index += 20
      } else current_index = 0


      for(const profile of profiles)
      {
        const channel = client.channels.cache.get(profile.channel)
        if(!channel) continue
        if(!channel.isText()) continue
      
        parse(`https://nitter.net/${profile.name}/rss`).then(async (rss : any) => 
        {
          if(rss.items && rss.items.length > 0)
          {
            for(const tweet of rss.items)
            {
              if(parseInt(tweet.published) > parseInt(profile.last_update))
              {

                const embed = new MessageEmbed()
                .setTitle(`Tweet de ${rss.title}`)
                .setColor(0x2fadd7)
                .setURL(tweet.link.replace('https://nitter.net/', 'https://twitter.com/'))
                .setAuthor(profile.name, rss.image, rss.link.replace('https://nitter.net/', 'https://twitter.com/'))
                .setThumbnail(rss.image)

                if(tweet.title){
                  if(tweet.title.startsWith('R to')){
                    embed.setTitle(`Respuesta de ${rss.title}`)
                    embed.setDescription(`${tweet.title.substring(5)}`)
                  }
                  else if(tweet.title.startsWith('RT by')){
                    const pfp = await getImageFromProfile(tweet.author.substring(1))
                    embed.setTitle(`RT de ${tweet.author}`)
                    embed.setDescription(`${tweet.title.substring(9+profile.name.length)}`)
                    if(pfp)
                      embed.setThumbnail(pfp)
                  } else
                    embed.setDescription(`${tweet.title}`)
                }

                const match = regexImage.exec(tweet.description)
                if(match != null){
                  embed.setImage(match[1])
                } else {
                  const match2 = regexVideo.exec(tweet.description)
                  if(match2 != null){
                    embed.setImage(match2[1])
                  }
                }
                channel.send({embeds: [embed]})
                
                await prisma.socials.update({
                  where: {
                    id: profile.id
                  },
                  data: {
                    last_update: String(tweet.published)
                  }
                })
                break;
              }
            }
          }

        }).catch((err: Error | AxiosError) => {
          if(axios.isAxiosError(err)){
            if(err.response){
              if(err.response.status === 404){
              }
            }
          }
        })
      }
    }

    setInterval(checkTwitter, 60000) // cada minuto
  }
}

export const events = [checker]
