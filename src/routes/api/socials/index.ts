import { Router } from 'express';
import facebook from './facebook';
import twitch from './twitch';
import twitter from './twitter';
import youtube from './youtube'

const router = Router();
router.use(youtube)
router.use(twitter)
router.use(twitch)
router.use(facebook)

export default router