import { Router } from "express";
import auth_router from "../auth/router.auth";
import integrations_router from "../integrations/router.integrations";
import chats_router from "../chats/router.chats";

const v1_router: Router = Router();

v1_router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

v1_router.use("/auth", auth_router);
v1_router.use("/integrations", integrations_router);
v1_router.use("/chat", chats_router);

export default v1_router;
