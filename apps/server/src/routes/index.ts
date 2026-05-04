import { Router } from 'express';
import authRoutes from './auth.routes';
import integrationRouter from './integration.routes';

const router: Router = Router();

router.use('/auth', authRoutes);
router.use('/integrations', integrationRouter);

export default router;
