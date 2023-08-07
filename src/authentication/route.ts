import * as controller from './controller';
import { Router } from 'express';

const router = Router();

router.post('/login', controller.login);

export default router;
