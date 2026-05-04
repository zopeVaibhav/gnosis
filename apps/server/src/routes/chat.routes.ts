import { Router } from 'express';
import { chatController } from '../controllers/chat/chatController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/', authMiddleware, chatController);

export default router;
