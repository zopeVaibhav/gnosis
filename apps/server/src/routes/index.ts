import { Router } from 'express';
import authRoutes from './auth.routes';
import integrationRouter from './integration.routes';
import chatRouter from './chat.routes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/integrations', integrationRouter);
router.use('/chat', chatRouter);

export default router;
