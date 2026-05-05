import { Router } from 'express';
import { signInController } from '../controllers/auth/signInController';
import { logoutController } from '../controllers/auth/logoutController';
import { refreshController } from '../controllers/auth/refreshController';
import { internalMiddleware } from '../middlewares/internal.middleware';

const router: Router = Router();

router.post('/signin', internalMiddleware, signInController);
router.post('/refresh', refreshController);
router.post('/logout', logoutController);

export default router;
