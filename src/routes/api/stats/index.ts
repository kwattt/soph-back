import { Router } from 'express';
import levels from './levels';
import shop from './shop';

const router = Router();
router.use(shop)
router.use(levels)

export default router