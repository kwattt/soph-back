import { Router } from 'express';
import welcome from './welcome';
import commands from './commands';

const router = Router();
router.use(welcome)
router.use(commands)

export default router