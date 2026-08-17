const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

// v1 base url
export const API_URL = BACKEND_URL + "/api/v1";

// auth routes
export const SIGN_URL = API_URL + "/auth/signin";
export const REFRESH_URL = API_URL + "/auth/refresh";
export const LOGOUT_URL = API_URL + "/auth/logout";

// integrations routes
export const GET_INTEGRATIONS = API_URL + "/integrations";
export const LINK_INTEGRATION_URL = API_URL + "/integrations/link";

// chats routes
export const SEND_MESSAGE = API_URL + "/chat/send-message";
export const GET_CHATS = API_URL + "/chat/get-chats";
export const GET_MESSAGES = (id: string) => `${API_URL}/chat/get-messages/${id}`;
