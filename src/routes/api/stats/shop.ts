import {Router} from 'express'
import { is } from 'typescript-is'

import {guildAccess, guildExists} from './../../../middleware/discord/guild'
import { PrismaClient } from '@prisma/client'
import { Limits } from '../../../limits'

const router = Router()
const prisma = new PrismaClient();

router.use(guildAccess)
router.use(guildExists)

interface Shop {
  name: string,
  role: string,
  channel: string,
  price: number,
  type: number
}

router.post('/updateShop', async (req, res) => {
  const {guild} = req.query
  const data = req.body

  if(is<Shop[]>(data)){
    if(data.length > Limits[req.guild_type].shops)
    {
      return res.sendStatus(400)
    }

    if(data.every(shop => shop.name.length < 120 && shop.role.length < 30 && shop.channel.length < 30)){
      await prisma.shops.deleteMany({
        where: {
          guild: String(guild)
        }
      })

      const vals = data.map(shop => {
        return {
          ...shop,
          guild: String(guild)
        }
      })

      await prisma.shops.createMany({
        data: vals
      })

      res.sendStatus(200)
      return
    }
  }
  res.sendStatus(400)
})

router.get('/shop', async (req, res) => {
  const {guild} = req.query

  const shop = await prisma.shops.findMany({
    where: {
      guild: String(guild)
    },
    select: {
      guild: true,
      name: true,
      role: true,
      channel: true,
      price: true,
      type: true
    }
  })

  res.send(shop)
})
export default router