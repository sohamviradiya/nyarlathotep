import { extractToken } from "@/server/auth/auth.util";
import { createCommunity, searchCommunitiesByName } from "@/server/community/community.service";
import { generateHexString } from "@/server/community/community.util";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const search_string = request.nextUrl.searchParams.get("query") || "";
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    return ApiResponse(await searchCommunitiesByName(search_string, limit));
};

export async function POST(request: NextRequest) {
    const body = await request.json();
    try {
        const token = extractToken(request.headers);
        if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));
        const name = body.name || `Community #${generateHexString()}`;
        const description = body.description || `${name} was created on ${new Date().toLocaleString()}`;
        return ApiResponse(await createCommunity({
            name,
            description,
        }, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}
