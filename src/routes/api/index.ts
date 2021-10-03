import { Router } from 'express';
import withAuth from './withauth'
import noAuth from './noauth'

const router = Router();
router.use(withAuth)
router.use(noAuth)

export default router