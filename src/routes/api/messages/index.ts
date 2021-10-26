import { Router } from 'express';
import welcome from './welcome';
import commands from './commands';
import oracle from './oracle';

const router = Router();
router.use(welcome)
router.use(oracle)
router.use(commands)

export default router