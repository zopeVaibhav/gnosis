import { Router } from "express";
import { require_auth } from "../../middlewares/middleware.auth";
import { require_internal_secret } from "../../middlewares/middleware.internal";
import ListIntegrationsController from "../../controllers/integrations/controller.list_integrations";
import LinkAccountController from "../../controllers/integrations/controller.link_account";

const integrations_router: Router = Router();

integrations_router.get("/", require_auth, ListIntegrationsController.process);
integrations_router.post("/link", require_internal_secret, LinkAccountController.process);

export default integrations_router;
