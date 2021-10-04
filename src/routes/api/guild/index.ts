import {Router} from 'express'
import guildCheck from './../../../middleware/discord/guild'

import { PrismaClient } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';

const router = Router()
const prisma = new PrismaClient();

router.use(guildCheck)

router.post('/updateGuild', async (req, res) => {
  const {guild} = req.query
  const {prefix} = req.body

  if(!prefix){
    res.sendStatus(400)
    return
  }

  try {
    await prisma.guilds.update({
      where: {
        guild: String(guild)
      },
      data: {
        prefix: prefix
      }
    })
  } catch (err) { 
    if(err instanceof PrismaClientKnownRequestError){
      if(err.code === 'P2025'){
        res.sendStatus(404)
        return
      }
      else console.log(err)
    }
  }
  res.sendStatus(200)
})

router.get('/getGuild', async (req, res) => {
  const {guild} = req.query

  try {
    var result = await prisma.guilds.findUnique({
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
          levels: 0
        }
      })
    res.send(result)  
    return
  } catch(err) {
    console.log(err)
  }

  res.sendStatus(500)

})

export default router