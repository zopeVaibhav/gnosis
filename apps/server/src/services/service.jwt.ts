import jwt from "jsonwebtoken";
import { env } from "../configs/env";

export interface SessionTokenPayload {
    userId: string;
    iat: number;
    exp: number;
}

export default class JwtService {
    static sign_access_token(userId: string) {
        return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
            expiresIn: env.ACCESS_TOKEN_TTL_SEC,
        });
    }

    static sign_refresh_token(userId: string) {
        return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
            expiresIn: env.REFRESH_TOKEN_TTL_SEC,
        });
    }

    static verify_access_token(token: string) {
        return jwt.verify(token, env.JWT_ACCESS_SECRET) as SessionTokenPayload;
    }

    static verify_refresh_token(token: string) {
        return jwt.verify(token, env.JWT_REFRESH_SECRET) as SessionTokenPayload;
    }

    static refresh_expiry_date() {
        return new Date(Date.now() + env.REFRESH_TOKEN_TTL_SEC * 1000);
    }
}
