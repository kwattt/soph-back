import { Router } from 'express';

import extra from './extra'
const router = Router();

router.use('/extra', extra)

export default router