const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_URL = BACKEND_URL + '/api/v1';

const AUTH_BASE_URL = API_URL + '/auth';
export const SIGN_URL = AUTH_BASE_URL + '/signin';
export const REFRESH_TOKEN_URL = AUTH_BASE_URL + '/refresh';
export const LOGOUT_URL = AUTH_BASE_URL + '/logout';
