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

router.post('/updateStalk', async (req, res) => {
  const {guild} = req.query

})

router.get('/stalk', async (req, res) => {
  const {guild} = req.query
})

export default router