import { extractToken } from "@/server/auth/auth.util";
import { REQUEST_TYPE } from "@/server/request/request.module";
import { sendRequest } from "@/server/request/request.service";
import { STATUS_CODES } from "@/server/response/response.module";
import { returnError, returnResponse } from "@/server/response/response.util";
import { getUserByID } from "@/server/user/user.service";
import { NextRequest } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        return returnResponse(await getUserByID(params.id));
    }
    catch (error: any) {
        return returnError(error);
    }
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token)
        return returnResponse({ code: STATUS_CODES.UNAUTHORIZED, message: "Unauthorized, Please Login again" });

    const body = await request.json();

    return returnResponse(await sendRequest({
        receiver: params.id,
        type: REQUEST_TYPE.CONNECT,
        message: body.message || "",
    }, token));
}

