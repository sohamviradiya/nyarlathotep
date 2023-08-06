import { extractToken } from "@/server/auth/auth.util";
import { confirmMessage, deleteMessage, getMessage, updateMessage } from "@/server/message/message.service";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));
    try {
        return ApiResponse(await getMessage(params.id, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
};

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));

    const { status } = await request.json();
    if (!status) return ApiResponse(BadReq({ message: "Missing state" }));
    try {
        return ApiResponse(await confirmMessage(params.id, status, token));
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