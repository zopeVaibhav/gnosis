const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_URL = BACKEND_URL + '/api/v1';

export const SIGN_URL = API_URL + '/auth/signin';
export const LINK_URL = API_URL + '/auth/link';
export const LOGOUT_URL = API_URL + '/auth/logout';
