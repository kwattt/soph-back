import {Router} from 'express'
import {Client} from 'discord.js'

import client from './../../discord/'

const router = Router()

router.use((req, res, next) => {
  req.client = client
  next();
})

declare global {
  namespace Express {
    interface Request {
      client: Client
    }
  }
}

export default router