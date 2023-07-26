import { extractToken } from "@/server/auth/auth.util";
import { deleteContact, getMessages } from "@/server/contact/contact.service";
import { addMessage } from "@/server/message/message.service";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));;
    try {
        return ApiResponse(await getMessages(params.id, token));
    } catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));;
    const { content } = await request.json();
    if (!content) return ApiResponse(BadReq({ message: "Missing content" }));
    try {
        return ApiResponse(await addMessage(params.id, content, token));
    }
    catch (error: any) {
        console.error(error);
        return ApiResponse(BadReq(error));
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));;
    try {
        return ApiResponse(await deleteContact(params.id, token));
    } catch (error: any) {
        return ApiResponse(BadReq(error));
    }
}