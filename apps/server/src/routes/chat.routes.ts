import { Router } from 'express';
import { chatController } from '../controllers/chat/chatController';
import { getChatsController } from '../controllers/chat/getChatsController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/get-messages', authMiddleware, getChatsController);
router.post('/send-message', authMiddleware, chatController);

export default router;
