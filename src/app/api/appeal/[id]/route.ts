import { APPEAL_STATUS } from "@/server/appeal/appeal.module";
import { acceptAppeal, markAppeal, rejectAppeal,getAppeal, withdrawAppeal } from "@/server/appeal/appeal.service";
import { extractToken } from "@/server/auth/auth.util";
import { ApiResponse, BadReq } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(BadReq({ message: "Invalid Token" }));
    try {
        return ApiResponse(await getAppeal(params.id, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(BadReq({ message: "Invalid Token" }));
    try {
        return ApiResponse(await markAppeal(params.id, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
};

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(BadReq({ message: "Invalid Token" }));
    try {
        return ApiResponse(await withdrawAppeal(params.id, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}