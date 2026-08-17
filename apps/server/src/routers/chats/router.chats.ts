import { Router } from "express";
import { require_auth } from "../../middlewares/middleware.auth";
import SendMessageController from "../../controllers/chat/controller.send_message";
import GetChatsController from "../../controllers/chat/controller.get_chats";
import GetMessagesController from "../../controllers/chat/controller.get_messages";

const chats_router: Router = Router();

chats_router.get("/get-messages/:id", require_auth, GetMessagesController.process);
chats_router.get("/get-chats", require_auth, GetChatsController.process);
chats_router.post("/send-message", require_auth, SendMessageController.process);

export default chats_router;
