import { extractToken } from "@/server/auth/auth.util";
import { getCommunityAppeals } from "@/server/community/community.service";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));
    try {
        return ApiResponse(await getCommunityAppeals(params.id, token));
    }
    catch (e: any) {
        return ApiResponse(BadReq({ message: e.message }));
    }
}


