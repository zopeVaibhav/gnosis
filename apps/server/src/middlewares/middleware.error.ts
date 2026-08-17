import type { Request, Response } from "express";
import ResponseWriter from "../services/service.response";

export function not_found_handler(_req: Request, res: Response) {
    return ResponseWriter.not_found(res, "Route not found");
}
