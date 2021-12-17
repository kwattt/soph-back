import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'
import { Limits } from '../../../limits'

const router = Router()
const prisma = new PrismaClient();
router.use(guildAccess)
router.use(guildExists)

interface MessageContent {
  channel: string,
  content: Message[]
}

interface Message {
  msg: string
  type: number
}

router.post('/updateWelcome', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<MessageContent>(data)){
    if(data.content.length > Limits[req.guild_type].welcome)
    {
      return res.sendStatus(400)
    }
    if(data.content.every(ach => ach.msg.length <= 201)){
      await prisma.welcomes.deleteMany({
        where: {
          guild: String(guild)
        }
      })
      const vals = data.content.map(msg => {return {...msg, guild: String(guild)}})
      await prisma.welcomes.createMany({
        data: vals
      })
      if(data.channel){
        await prisma.guilds.update({
          where: {
            guild: String(guild)
          },
          data: {
            welcome: String(data.channel)
          }
        })
      }

      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/welcome', async (req, res) => {
  const {guild} = req.query

  const welcomeChannel = await prisma.guilds.findUnique({
    where: {
      guild: String(guild)
    },
    select: {
      welcome: true
    }
  })

  const result = await prisma.welcomes.findMany({
    where: {
      guild: String(guild),
    },
    select: {
      type: true,
      msg: true
    }
  })
  res.send({channel: welcomeChannel?.welcome, content: result})
})

export default router