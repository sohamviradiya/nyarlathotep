import { extractToken } from "@/server/auth/auth.util";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { getContactsFromToken } from "@/server/user/user.service";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const token = extractToken(request.headers);
    if (!token) return Unauthorized({ message: "Missing token" });
    try {
        return ApiResponse(await getContactsFromToken(token));
    } catch (error: any) {
        return BadReq(error);
    }
};