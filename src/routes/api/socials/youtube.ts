import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'
import {youtube, getChannelData} from '../../../middleware/youtube'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)
router.use(guildExists)

interface Youtube {
  channel:  string
  name: string
  type: number
  real_name: string
}

router.post('/verifyChannel', async (req, res) => { 
  const {channelId} = req.body

  const items =  await getChannelData(String(channelId))
  if(items){
    res.send({
      channelName: items[0].snippet?.title
    })
  }
  else res.sendStatus(404)
})

router.post('/updateYoutube', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Youtube[]>(data)){
    if(data.every(m => m.channel.length < 30 && m.name.length < 50 && m.real_name.length < 50)){

      await prisma.socials.deleteMany({
        where: {
          guild: String(guild),
          platform: "youtube"
        }
      })

      const idata = data.map(m => {
        return {
          ...m, 
          guild: String(guild),
          live: 0,
          last_update: "0",
          platform: "youtube"
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

router.get('/youtube', async (req, res) => {
  const {guild} = req.query

  const channels = await prisma.socials.findMany({
    where: {
      guild: String(guild),
      platform: 'youtube'
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