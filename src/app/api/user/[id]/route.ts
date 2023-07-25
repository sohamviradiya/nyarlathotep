import { extractToken } from "@/server/auth/auth.util";
import { REQUEST_TYPE } from "@/server/request/request.module";
import { sendRequest } from "@/server/request/request.service";
import { STATUS_CODES } from "@/server/response/response.module";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { getUserByID } from "@/server/user/user.service";
import { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        return ApiResponse(await getUserByID(params.id));
    }
    catch (error: any) {
        return BadReq(error);
    }
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return Unauthorized({ message: "No token provided" });
    const body = await request.json();
    try {
        return ApiResponse(await sendRequest({
            receiver: params.id,
            type: REQUEST_TYPE.CONNECT,
            message: body.message || "",
        }, token));
    }
    catch (error: any) {
        return BadReq(error);
    }
}

