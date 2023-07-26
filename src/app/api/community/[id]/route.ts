import { extractToken } from "@/server/auth/auth.util";
import { getCommunityByID } from "@/server/community/community.service";
import { APPEAL_TYPE } from "@/server/appeal/appeal.module";
import { sendAppeal } from "@/server/appeal/appeal.service";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    return ApiResponse(await getCommunityByID(params.id));
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));

    const body = await request.json();
    return ApiResponse(await sendAppeal({
        receiver: params.id,
        type: APPEAL_TYPE.JOIN,
        message: body.message,
    }, token));
}