import { Router } from 'express';
import withAuth from './withauth'
import noAuth from './noauth'

const router = Router();
router.use(noAuth)
router.use(withAuth)

export default router