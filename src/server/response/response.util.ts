import { STATUS_CODES, Service_Response } from "./response.module";
import { NextResponse } from "next/server";
export async function ApiResponse(response: Service_Response<any>) {
    if (response.data)
        return NextResponse.json({ ...response.data, message: response.message }, {
            status: response.code,
        });
    else
        return NextResponse.json({ message: response.message }, { status: response.code });
}

export async function BadReq(error: { message: string }) {
    return NextResponse.json({ message: error.message }, { status: STATUS_CODES.BAD_REQUEST });
}

export async function Unauthorized(error: { message: string }) {
    return NextResponse.json({ message: error.message }, { status: STATUS_CODES.UNAUTHORIZED });
}