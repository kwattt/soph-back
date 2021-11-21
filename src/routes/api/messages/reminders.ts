import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

import { Limits } from '../../../limits'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)
router.use(guildExists)

interface Reminders {
  name: string
  message: string
}

router.post('/updateReminders', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Reminders[]>(data)){

    if(data.length > Limits[req.guild_type].autochannel)
      return res.sendStatus(400)

    if(data.every(cmd => cmd.message.length < 501 && cmd.name.length < 51)){
      await prisma.msgcustoms.deleteMany({
        where: {
          guild: String(guild)
        }
      })
      const vals = data.map(cmd => {return {...cmd, guild: String(guild), time: 0}})
      await prisma.msgcustoms.createMany({
        data: vals
      })
      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/reminders', async (req, res) => {
  const {guild} = req.query

  const data = await prisma.msgcustoms.findMany({
    where: {
      guild: String(guild)
    }, 
    select: {
      name: true,
      message: true,
    }
  })

  res.send(data)
})

export default router