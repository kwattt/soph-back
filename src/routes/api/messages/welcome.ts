import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient();
router.use(guildAccess)
router.use(guildExists)

interface Message {
  msg: string
  type: number
}

router.post('/updateWelcome', async (req, res) => {
  const {guild} = req.query
  const {messages} = req.body

  if(Array.isArray(messages))
  {
    if(messages.every(msg => { return (is<Message>(msg) && msg?.msg?.length < 200) })){
      await prisma.welcomes.deleteMany({
        where: {
          guild: String(guild)
        }
      })
      const data = messages.map(msg => {return {...msg, guild: String(guild)}})
      await prisma.welcomes.createMany({
        data: data
      })
      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/welcome', async (req, res) => {
  const {guild} = req.query

  var result = await prisma.welcomes.findMany({
    where: {
      guild: String(guild),
    },
    select: {
      type: true,
      msg: true
    }
  })
  res.send(result)
})

export default router