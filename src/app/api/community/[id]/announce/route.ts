import { extractToken } from "@/server/auth/auth.util";
import { announceInCommunity, getCommunityAnnouncements } from "@/server/community/community.service";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));
    return ApiResponse(await getCommunityAnnouncements(params.id, token));
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));

    const { content } = await request.json() as { content: string };

    if (!content)
        return ApiResponse(BadReq({ message: "No content provided" }));

    return ApiResponse(await announceInCommunity({ content }, token, params.id));
}

