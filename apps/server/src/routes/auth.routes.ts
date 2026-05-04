import { Router } from 'express';
import { linkAccountController, signInController } from '../controllers/auth/signInController';
import { logoutController } from '../controllers/auth/logoutController';

const router: Router = Router();

router.post('/signin', signInController);
router.post('/link', linkAccountController);
router.post('/logout', logoutController);
export default router;
