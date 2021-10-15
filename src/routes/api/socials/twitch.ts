import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)
router.use(guildExists)

interface Twitch {
  channel:  string
  name: string
  type: number
}

router.get('/updateTwitch', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Twitch[]>(data)){
    if(data.every(m => {m.channel.length < 30 && m.name.length < 50})){

      await prisma.socials.deleteMany({
        where: {
          guild: String(guild),
          platform: "twitch"
        }
      })

      const idata = data.map(m => {
        return {
          ...m, 
          guild: String(guild),
          live: 0,
          last_update: "0",
          platform: "twitch",
          real_name: ""
        }
      })

      await prisma.socials.createMany({
        data: idata
      })

      res.sendStatus(200)
      return
    }
    res.sendStatus(400)
    return
  }

  res.sendStatus(400)
})

router.get('/twitch', async (req, res) => {
  const {guild} = req.query

  const channels = await prisma.socials.findMany({
    where: {
      guild: String(guild),
      platform: 'twitch'
    },
    select: {
      channel: true,
      name: true,
      last_update: true,
      live: true,
      type: true,
      real_name: true,
    }
  })

  return channels
})

export default router