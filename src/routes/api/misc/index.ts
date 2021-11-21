import { Router } from 'express';
import autochannel from './autochannel';
import bday from './bday';
import purge from './purge';
import stalk from './stalk';

const router = Router();
router.use(bday)
router.use(autochannel)
router.use(purge)
router.use(stalk)

export default router