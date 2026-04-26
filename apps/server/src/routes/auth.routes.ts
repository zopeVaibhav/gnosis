import { Router } from 'express';
import { signInController } from '../controllers/auth/signInController';
import { refreshTokenController } from '../controllers/auth/refreshTokenController';
import { logoutController } from '../controllers/auth/logoutController';

const router: Router = Router();

router.post('/signin', signInController);
router.post('/refresh', refreshTokenController);
router.post('/logout', logoutController);
export default router;
