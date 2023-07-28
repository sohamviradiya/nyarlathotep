import { extractToken } from "@/server/auth/auth.util";
import { BadReq, ApiResponse, Unauthorized } from "@/server/response/response.util";
import { addUser, deleteUser, getProfileFromToken, updateUser } from "@/server/user/user.service";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));
    try {
        return ApiResponse(await getProfileFromToken(token));
    } catch (error: any) {
        console.log(error);
        return ApiResponse(BadReq(error));
    }
};

export async function POST(request: NextRequest) {
    const { user } = await request.json();
    if (!user.email || !user.name || !user.password) return ApiResponse(BadReq({ message: "Missing user" }));
    try {
        return ApiResponse(await addUser({
            name: user.name,
            email: user.email,
            address: user?.address,
            bio: user?.bio,
            password: user.password,
        }));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
};

export async function PUT(request: NextRequest) {
    const { user } = await request.json();
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));
    if (!user) return ApiResponse(BadReq({ message: "Missing user" }));
    try {
        return ApiResponse(await updateUser(user, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
};

export async function DELETE(request: NextRequest) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(Unauthorized({ message: "Missing token" }));
    try {
        return ApiResponse(await deleteUser(token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
};
