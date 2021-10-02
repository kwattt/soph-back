import { Router } from 'express';
import api from './api'
import auth from './auth'

const router = Router();
router.use('/api', api)
router.use('/auth', auth)

export default router