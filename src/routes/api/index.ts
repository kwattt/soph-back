import { Router } from 'express';
import withAuth from './withauth'

const router = Router();
router.use(withAuth)

export default router