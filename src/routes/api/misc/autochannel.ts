import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient();
router.use(guildAccess)
router.use(guildExists)

interface Autochannel {
  origenchannel: string
  targetchannel: string
}

router.post('/updateAutochannel', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Autochannel[]>(data)){
    if(data.every(ach => ach.origenchannel.length < 30 && ach.targetchannel.length < 30)){

      await prisma.autochannels.deleteMany({
        where: {
          guild: String(guild)
        }
      })

      let pdata = data.map(ach => { return {...ach, guild: String(guild)}})
      await prisma.autochannels.createMany({
        data: pdata
      })

      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/autochannel', async (req, res) => {
  const {guild} = req.query

  const data = await prisma.autochannels.findMany({
    where: {
      guild: String(guild)
    },
    select: {
      origenchannel: true,
      targetchannel: true
    }
  })

  res.send(data)
})

export default router