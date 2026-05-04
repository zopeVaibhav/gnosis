import { Router } from 'express';
import { chatController } from '../controllers/chat/chatController';

const router: Router = Router();

router.post('/', chatController);

export default router;
