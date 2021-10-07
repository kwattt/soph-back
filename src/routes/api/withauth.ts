import { Router } from 'express';
import isLogged from '../../middleware/auth/logged';
import guild from './guild';
import messages from './messages';
import misc from './misc';
import stats from './stats';
import user from './user';

const router = Router();

router.use((req, res, next) => {
  if(!isLogged(req)){
    res.sendStatus(401)
    return
  }
  next()
})

router.use('/user', user)
router.use('/messages', messages)
router.use('/stats', stats)
router.use('/guild', guild)
router.use('/misc', misc)

export default router