import { NextRequest } from 'next/server';
import { ApiResponse, BadReq } from '@/server/response/response.util';
import { extractToken } from '@/server/auth/auth.util';
import { rejectAppeal } from '@/server/appeal/appeal.service';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractToken(request.headers);
    if (!token) return ApiResponse(BadReq({ message: "Invalid Token" }));
    try {
        return ApiResponse(await rejectAppeal(params.id, token));
    }
    catch (error: any) {
        return ApiResponse(BadReq(error));
    }
};


