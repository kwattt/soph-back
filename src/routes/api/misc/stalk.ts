import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)
router.use(guildExists)

interface Stalk {
  roles: Array<string>
  messages: Array<string>
}

router.post('/updateStalk', async (req, res) => {
  const {guild} = req.query

  const data = req.body

  if(is<Stalk>(data)){
    if(data.roles.every(role => role.length < 30)
    && data.messages.every(msg => msg.length < 250))
    {
      try {
        await prisma.stalkroles.deleteMany({
          where: {
            guild: String(guild)
          }
        })
        await prisma.stalkmsgs.deleteMany({
          where: {
            guild: String(guild)
          }
        })
        let roles =  data.roles.map(role => {return {role: role, guild: String(guild)}})
        await prisma.stalkroles.createMany({
          data: roles
        })
        let messages = data.messages.map(msg => {return {msg: msg, guild: String(guild)}})
        await prisma.stalkmsgs.createMany({
          data: messages
        })
      }
      catch (err) {
        console.log(err)
        res.sendStatus(500)
        return
      }
      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/stalk', async (req, res) => {
  const {guild} = req.query

  const data = await prisma.stalkroles.findMany({
    where: {
      guild: String(guild)
    },
    select: {
      role: true 
    }
  })

  const data2 = await prisma.stalkmsgs.findMany({
    where: {
      guild: String(guild)
    },
    select: {
      msg: true 
    }
  })

  res.send({roles: data, messages: data2})
})

export default router