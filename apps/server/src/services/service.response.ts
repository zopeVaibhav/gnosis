import { Response } from "express";
import { ApiResponse, ERROR_CODES, ErrorCode, STREAM_MESSAGE } from "@gnosis/types";

export default class ResponseWriter {
    static success<T>(res: Response, data: T, message = "OK", code: string = ERROR_CODES.SUCCESS) {
        return this.send_response(res, 200, this.envelope(true, code, message, data));
    }

    static created<T>(res: Response, data: T, message = "Created") {
        return this.send_response(
            res,
            201,
            this.envelope(true, ERROR_CODES.SUCCESS, message, data),
        );
    }

    static invalid_data(
        res: Response,
        message = "Invalid data",
        code: ErrorCode = ERROR_CODES.INVALID_DATA,
    ) {
        return this.send_response(res, 400, this.envelope(false, code, message, null));
    }

    static unauthenticated(
        res: Response,
        message = "Unauthenticated",
        code: ErrorCode = ERROR_CODES.UNAUTHENTICATED,
    ) {
        return this.send_response(res, 401, this.envelope(false, code, message, null));
    }

    static not_found(res: Response, message = "Not found") {
        return this.send_response(
            res,
            404,
            this.envelope(false, ERROR_CODES.NOT_FOUND, message, null),
        );
    }

    static system_error(res: Response, message = "Internal server error") {
        return this.send_response(
            res,
            500,
            this.envelope(false, ERROR_CODES.SYSTEM_ERROR, message, null),
        );
    }

    static custom(
        res: Response,
        status_code: number,
        success: boolean,
        code: string,
        message: string,
        data: unknown = null,
    ) {
        return this.send_response(res, status_code, this.envelope(success, code, message, data));
    }

    static stream(res: Response, content: string, type: STREAM_MESSAGE) {
        return res.write(`data: ${JSON.stringify({ type, content })}\n\n`);
    }

    private static envelope<T>(
        success: boolean,
        code: string,
        message: string,
        data: T | null,
    ): ApiResponse<T> {
        return {
            success,
            code,
            message,
            data,
            timestamp: new Date().toISOString(),
        } as ApiResponse<T>;
    }

    private static send_response<T>(res: Response, status_code: number, response: ApiResponse<T>) {
        return res.status(status_code).json(response);
    }
}
