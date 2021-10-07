import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

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
    if(data.every(purge => {purge.channel.length < 30 })){
      // delete all

      // insermany
      
      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/purge', async (req, res) => {
  const {guild} = req.query

  const data = await prisma.guilds.findUnique({
    where: {
      guild: String(guild)
    },
    select: {
      birthday: true,
      bdaymsg: true,
      bdayutc: true
    }
  })

  res.send(data)
})

export default router