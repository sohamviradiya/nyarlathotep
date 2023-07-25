import { APPEAL_STATUS } from "@/server/appeal/appeal.module";
import { acceptAppeal, markAppeal, rejectAppeal } from "@/server/appeal/appeal.service";
import { extractToken } from "@/server/auth/auth.util";
import { ApiResponse, BadReq } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return BadReq({ message: "Invalid Token" });
    try {
        return ApiResponse(await acceptAppeal(params.id, token));
    }
    catch (error: any) {
        return BadReq({ message: error.message });
    }
};

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return BadReq({ message: "Invalid Token" });
    try {
        return ApiResponse(await markAppeal(params.id, token));
    }
    catch (error: any) {
        return BadReq({ message: error.message });
    }
};

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return BadReq({ message: "Invalid Token" });
    try {
        return ApiResponse(await rejectAppeal(params.id, token));
    }
    catch (error: any) {
        return BadReq({ message: error.message });
    }
};


