import { Router } from 'express';
import { chatController } from '../controllers/chat/chatController';
import { getChatsController } from '../controllers/chat/getChatsController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { getChatMessagesController } from '../controllers/chat/getMessagesController';

const router: Router = Router();

router.get('/get-messages/:id', authMiddleware, getChatMessagesController);
router.get('/get-chats', authMiddleware, getChatsController);
router.post('/send-message', authMiddleware, chatController);

export default router;
