import { APPEAL_STATUS } from "@/server/appeal/appeal.module";
import { confirmAppeal } from "@/server/appeal/appeal.service";
import { extractToken } from "@/server/auth/auth.util";
import { ApiResponse, BadReq } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return BadReq({ message: "Invalid Token" });
    try {
        return ApiResponse(await confirmAppeal(params.id, APPEAL_STATUS.ACCEPTED, token));
    }
    catch (error: any) {
        return BadReq({ message: error.message });
    }
};

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return BadReq({ message: "Invalid Token" });
    try {
        return ApiResponse(await confirmAppeal(params.id, APPEAL_STATUS.REJECTED, token));
    }
    catch (error: any) {
        return BadReq({ message: error.message });
    }
};


