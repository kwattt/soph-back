import { Router } from 'express';
import welcome from './welcome';
import reminders from './reminders';
import oracle from './oracle';

const router = Router();
router.use(welcome)
router.use(oracle)
router.use(reminders)

export default router