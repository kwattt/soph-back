import {Router} from 'express'
import guilds from './guilds'

const router = Router()

router.use(guilds)

export default router