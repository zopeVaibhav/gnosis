import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { internalMiddleware } from '../middlewares/internal.middleware';
import {
    getIntegrations,
    linkAccountController,
} from '../controllers/integrations/integrationsController';

const router: Router = Router();

router.get('/', authMiddleware, getIntegrations);
router.post('/link', internalMiddleware, linkAccountController);

export default router;
