import { STATUS_CODES, Service_Response } from "./response.module";
import { NextResponse } from "next/server";
export function ApiResponse(response: Service_Response<any>) {
    if (response.data)
        return NextResponse.json({ message: response.message, payload: response.data }, {
            status: response.code,
        });
    else
        return NextResponse.json({ message: response.message }, { status: response.code });
}

export function BadReq(error: { message: string }) : Service_Response<null> {
    return {
        code: STATUS_CODES.BAD_REQUEST,
        message: error.message,
    };
}

export function Unauthorized(error: { message: string }) : Service_Response<null> {
    return {
        code: STATUS_CODES.UNAUTHORIZED,
        message: error.message,
    }
}

export function Forbidden(error: { message: string }) : Service_Response<null> {
    return {
        code: STATUS_CODES.FORBIDDEN,
        message: error.message,
    }
}