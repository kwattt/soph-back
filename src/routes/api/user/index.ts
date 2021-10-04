import {Router} from 'express'
import guilds from './guilds'
import user from './user'

const router = Router()

router.use(guilds)
router.use(user)

export default router