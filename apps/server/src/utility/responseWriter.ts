import { Response } from 'express';
import { ApiResponse, ERROR_CODES, ErrorCode } from '@gnosis/types';

export class ResponseWriter {
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

    static success<T>(res: Response, data: T, message = 'OK', code: string = ERROR_CODES.SUCCESS) {
        return res.status(200).json(this.envelope(true, code, message, data));
    }

    static created<T>(res: Response, data: T, message = 'Created') {
        return res.status(201).json(this.envelope(true, ERROR_CODES.SUCCESS, message, data));
    }

    static invalid_data(
        res: Response,
        message = 'Invalid data',
        code: ErrorCode = ERROR_CODES.INVALID_DATA,
    ) {
        return res.status(400).json(this.envelope(false, code, message, null));
    }

    static unauthenticated(
        res: Response,
        message = 'Unauthenticated',
        code: ErrorCode = ERROR_CODES.UNAUTHENTICATED,
    ) {
        return res.status(401).json(this.envelope(false, code, message, null));
    }

    static not_found(res: Response, message = 'Not found') {
        return res.status(404).json(this.envelope(false, ERROR_CODES.NOT_FOUND, message, null));
    }

    static system_error(res: Response, message = 'Internal server error') {
        return res.status(500).json(this.envelope(false, ERROR_CODES.SYSTEM_ERROR, message, null));
    }

    static custom(
        res: Response,
        status: number,
        success: boolean,
        code: string,
        message: string,
        data: unknown = null,
    ) {
        return res.status(status).json(this.envelope(success, code, message, data));
    }
}
