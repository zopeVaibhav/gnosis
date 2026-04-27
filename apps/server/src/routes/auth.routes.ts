import { Router } from 'express';
import { signInController } from '../controllers/auth/signInController';
import { logoutController } from '../controllers/auth/logoutController';

const router: Router = Router();

router.post('/signin', signInController);
router.post('/logout', logoutController);
export default router;
