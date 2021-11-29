import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'
import { Limits } from '../../../limits'

const router = Router()
const prisma = new PrismaClient();
router.use(guildAccess)
router.use(guildExists)

interface Purge {
  channel: string
  hour: number
  minute: number
  utc: number
}

router.post('/updatePurge', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Purge[]>(data)){
    if(data.length > Limits[req.guild_type].purge)
    {
      return res.sendStatus(400)
    }

    if(data.every(purge => purge.channel.length < 30)){

      await prisma.purges.deleteMany({
        where: {
          guild: String(guild)
        }
      })

      let pdata = data.map(purge => { return {...purge, guild: String(guild)}})
      await prisma.purges.createMany({
        data: pdata
      })

      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/purge', async (req, res) => {
  const {guild} = req.query

  const data = await prisma.purges.findMany({
    where: {
      guild: String(guild)
    },
    select: {
      channel: true,
      hour: true,
      minute: true,
      utc: true,
    }
  })

  res.send(data)
})

export default router