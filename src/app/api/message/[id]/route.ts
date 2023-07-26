import { extractToken } from "@/server/auth/auth.util";
import { confirmMessage, deleteMessage, updateMessage } from "@/server/message/message.service";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));

    const { state } = await request.json();
    if (!state) return ApiResponse(BadReq({ message: "Missing state" }));
    try {
        return ApiResponse(await confirmMessage(params.id, state, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));
    const { content } = await request.json();
    if (!content) return ApiResponse(BadReq({ message: "Missing message" }));

    try {
        return ApiResponse(await updateMessage(params.id, content, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));

    try {
        return ApiResponse(await deleteMessage(params.id, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}