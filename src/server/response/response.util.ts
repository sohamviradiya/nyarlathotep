import { STATUS_CODES, Service_Response } from "./response.module";
import { NextResponse } from "next/server";
export async function returnResponse(response: Service_Response<any>) {
    if (response.data)
        return NextResponse.json({ ...response.data, message: response.message }, {
            status: response.code,
        });
    else
        return NextResponse.json({ message: response.message }, { status: response.code });
}

export async function returnError(error: {message: string}) {
    return NextResponse.json({ message: error.message }, { status: STATUS_CODES.BAD_REQUEST });
}