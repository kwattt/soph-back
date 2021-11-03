import { is } from 'typescript-is'
import {Router} from 'express'
import {guildExists, guildAccess} from './../../../middleware/discord/guild'

import { PrismaClient } from '@prisma/client'
import { Limits } from '../../../limits'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)

router.get('/getGuild', async (req, res) => {
  const {guild} = req.query

    let result = await prisma.guilds.findUnique({
      where: {
        guild: String(guild),
      },
    })
  
    if(!result)
      result = await prisma.guilds.create({
        data: {
          guild: String(guild),
          welcome: '0',
          birthday: '0',
          stalk: 0, 
          bdaymsg: '',
          bdayutc: -5,
          type: 0,
          prefix: '!',
          levels: 0,
        } 
      })

    res.send({...result,
      limits: result.type === 0 ? Limits[0] : Limits[1]
    })  
    return
})

router.use(guildExists)

router.post('/updateGuild', async (req, res) => {
  const {guild} = req.query
  const {prefix} = req.body

  if(!is<string>(prefix)){
    res.sendStatus(400)
    return
  }

    await prisma.guilds.update({
      where: {
        guild: String(guild)
      },
      data: {
        prefix: prefix
      }
    })

  res.sendStatus(200)
})


export default router