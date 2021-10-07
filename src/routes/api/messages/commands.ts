import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)
router.use(guildExists)

interface Commands {
  name: string
  message: string
}

router.post('/updateCommands', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Commands[]>(data)){
    if(data.every(cmd => cmd.message.length < 500 && cmd.name.length < 50)){
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

router.get('/commands', async (req, res) => {
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