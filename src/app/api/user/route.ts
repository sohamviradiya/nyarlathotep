import { STATUS_CODES } from "@/server/response/response.module";
import { BadReq, ApiResponse } from "@/server/response/response.util";
import { searchUsersByName } from "@/server/user/user.service";
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
    const search_string = request.nextUrl.searchParams.get("query") || "";
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
    try {
        return ApiResponse(await searchUsersByName(search_string, limit));
    }
    catch (error: any) {
        return BadReq({ message: error.message });
    }
};


