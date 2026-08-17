import { Router } from "express";
import { require_internal_secret } from "../../middlewares/middleware.internal";
import SignInController from "../../controllers/auth/controller.sign_in";
import RefreshController from "../../controllers/auth/controller.refresh";
import LogoutController from "../../controllers/auth/controller.logout";

const auth_router: Router = Router();

auth_router.post("/signin", require_internal_secret, SignInController.process);
auth_router.post("/refresh", RefreshController.process);
auth_router.post("/logout", LogoutController.process);

export default auth_router;
