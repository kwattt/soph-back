import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'
import { Limits } from '../../../limits'

const router = Router()
const prisma = new PrismaClient();
router.use(guildAccess)
router.use(guildExists)

interface Oraculo {
  msg: string
}

router.post('/updateOraculo', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Oraculo[]>(data)){

    if(data.length > Limits[req.guild_type].oraculo)
      return res.sendStatus(400)

    if(data.every(ach => ach.msg.length <= 200)){
      await prisma.oraculos.deleteMany({
        where: {
          guild: String(guild)
        }
      })

      let pdata = data.map(ach => { return {...ach, guild: String(guild)}})
      await prisma.oraculos.createMany({
        data: pdata
      })

      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/oraculo', async (req, res) => {
  const {guild} = req.query

  const data = await prisma.oraculos.findMany({
    where: {
      guild: String(guild)
    },
    select: {
      msg: true,
    }
  })

  res.send(data)
})

export default router