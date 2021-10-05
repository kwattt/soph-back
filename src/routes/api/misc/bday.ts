import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient();
router.use(guildAccess)
router.use(guildExists)

interface Birthday {
  birthday: string
  bdaymsg: string
  bdayutc: number
}

router.post('/updateBirthday', async (req, res) => {
  const {guild} = req.query
  const bday = req.body

  if(is<Birthday>(bday)){
    if(bday.bdaymsg.length < 359)
      await prisma.guilds.update({
        where: {
          guild: String(guild)
        },
        data: bday
      })
      res.sendStatus(200)
    return
  }
  res.sendStatus(400)
})

router.get('/birthday', async (req, res) => {
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