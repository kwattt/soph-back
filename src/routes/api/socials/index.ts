import { Router } from 'express';
import youtube from './youtube'

const router = Router();
router.use(youtube)

export default router