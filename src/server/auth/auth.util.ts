import { IncomingHttpHeaders } from "http2";


export function extractToken(headers: Headers): string | null {
    return headers.get("Authorization")?.split(" ")[1] || null;
};
