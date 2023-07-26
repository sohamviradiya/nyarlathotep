import { extractToken } from "@/server/auth/auth.util";
import { APPEAL_TYPE } from "@/server/appeal/appeal.module";
import { sendAppeal, withdrawAppeal } from "@/server/appeal/appeal.service";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { getUserByID } from "@/server/user/user.service";
import { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        return ApiResponse(await getUserByID(params.id));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));
    const body = await request.json();
    try {
        return ApiResponse(await sendAppeal({
            receiver: params.id,
            type: APPEAL_TYPE.CONNECT,
            message: body.message || "",
        }, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "No token provided" }));
    try {
        return ApiResponse(await withdrawAppeal(params.id, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}

