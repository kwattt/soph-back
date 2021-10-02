import { Router } from 'express';
import isLogged from '../../middleware/logged';
import levels from './levels'

const router = Router();

router.use((req, res, next) => {
  if(!isLogged(req)){
    res.sendStatus(401)
    return
  }
  next()
})

router.get('/test', (req, res) => {
  res.send('logged!')
})

router.use('/levels', levels)

export default router