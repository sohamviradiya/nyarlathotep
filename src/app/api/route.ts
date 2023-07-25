import { STATUS_CODES } from "@/server/response/response.module";
import { ApiResponse } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function GET() {
    return ApiResponse({ code: STATUS_CODES.OK, message: "Welcome to Nyarlathotep" });
};

export async function POST(request: NextRequest) {
    let { name } = await request.json();
    if (!name)
        name = "Anonymous";
    return ApiResponse({ code: STATUS_CODES.OK, message: `Welcome to Nyarlathotep ${name}` });
}