import { extractToken } from "@/server/auth/auth.util";
import { getCommunityModerators } from "@/server/community/community.service";
import { APPEAL_TYPE } from "@/server/appeal/appeal.module";
import { STATUS_CODES } from "@/server/response/response.module";
import { ApiResponse, Unauthorized } from "@/server/response/response.util";
import { NextRequest } from "next/server";
import { sendAppeal } from "@/server/appeal/appeal.service";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));
    return ApiResponse(await getCommunityModerators(params.id, token));
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);

    if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));

    const body = await request.json();

    const message = body?.message || "User has requested to moderate your community";
    return ApiResponse(await sendAppeal({
        message: message,
        receiver: params.id,
        type: APPEAL_TYPE.MODERATE
    }, token));
}
