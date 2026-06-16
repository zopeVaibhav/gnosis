// custom response
export interface ApiResponseSuccess<T> {
    success: true;
    code: string;
    message: string;
    data: T;
    timestamp: string;
}

export interface ApiResponseError {
    success: false;
    code: string;
    message: string;
    data: null;
    timestamp: string;
}

export type ApiResponse<T = unknown> = ApiResponseSuccess<T> | ApiResponseError;

export const ERROR_CODES = {
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',
    INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
    REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
    INVALID_DATA: 'INVALID_DATA',
    NOT_FOUND: 'NOT_FOUND',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    SUCCESS: 'SUCCESS',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
