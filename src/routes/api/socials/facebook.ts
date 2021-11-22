import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)
router.use(guildExists)

interface Facebook {
  channel:  string
  name: string
  type: number
}

router.post('/updateFacebook', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Facebook[]>(data)){
    if(data.every(m => m.channel.length < 30 && m.name.length < 50)){

      await prisma.socials.deleteMany({
        where: {
          guild: String(guild),
          platform: "facebook"
        }
      })

      const idata = data.map(m => {
        return {
          ...m, 
          guild: String(guild),
          live: 0,
          last_update: "0",
          platform: "facebook",
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

router.get('/facebook', async (req, res) => {
  const {guild} = req.query

  const channels = await prisma.socials.findMany({
    where: {
      guild: String(guild),
      platform: 'facebook'
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

  res.send(channels)
})

export default router