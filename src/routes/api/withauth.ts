import { Router } from 'express';
import isLogged from '../../middleware/auth/logged';
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

export default router