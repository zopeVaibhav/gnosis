import { Request, Response } from "express";
import CookieService from "../../services/service.cookie";
import ResponseWriter from "../../services/service.response";

export default class LogoutController {
    static async process(_req: Request, res: Response) {
        try {
            CookieService.clear_session_cookies(res);
            return ResponseWriter.success(res, null, "Logged out");
        } catch (err) {
            console.error("LogoutController error: ", err);
            return ResponseWriter.system_error(res);
        }
    }
}
