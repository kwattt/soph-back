import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)
router.use(guildExists)

interface levelData {
  levels: number
  channels: string[]
}

router.post('/updateLevels', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<levelData>(data)){
    if(data.channels.every(cmd => cmd.length < 30)){
      await prisma.levelchannels.deleteMany({
        where: {
          guild: String(guild)
        }
      })
      const vals = data.channels.map(cmd => {return {guild: String(guild), channel: cmd}})
      await prisma.levelchannels.createMany({
        data: vals
      })
      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/top', async (req, res) => {
  const {guild} = req.query

  const levels = await prisma.levels.findMany({
    where: {
      guild: String(guild)
    },
    select: {
      uid: true,
      points: true,
      xp: true,
      level: true
    },
    orderBy: {
      level: "desc",
      xp: "desc"
    },
    take: 50
  }) 

  res.send({levels: levels})
})

router.get('/levels', async (req, res) => {
  const {guild} = req.query

  const channels = await prisma.levelchannels.findMany({
    where: {
      guild: String(guild)
    },
    select: {
      channel: true
    }
  }) 

  const active = await prisma.guilds.findUnique({
    where: {
      guild: String(guild)
    },
    select: {
      levels: true
    }
  })

  res.send({active: active, channels: channels})

})

export default router