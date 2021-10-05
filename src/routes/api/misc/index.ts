import { Router } from 'express';
import bday from './bday';

const router = Router();
router.use(bday)

export default router