import { generateClientToken, verifyClientToken, updateCredentials } from '@/server/auth/auth.service';
import { extractToken } from '@/server/auth/auth.util';
import { STATUS_CODES } from '@/server/response/response.module';
import { returnError, returnResponse } from '@/server/response/response.util';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const token = extractToken(request.headers);
    if (!token) return returnError({ message: 'Missing token' });
    try {
        return returnResponse(await verifyClientToken(token));
    }
    catch (error: any) {
        return returnError(error);
    }
};

export async function POST(request: NextRequest) {
    const { auth } = await request.json();
    if (!auth.email || !auth.password) return returnError({ message: 'Missing credentials' });
    try {
        return returnResponse(
            await generateClientToken({
                email: auth.email,
                password: auth.password,
            })
        );
    }
    catch (error: any) {
        return returnError(error);
    }
};

export async function PUT(request: NextRequest) {
    const { auth } = await request.json();
    if (!auth.email || !auth.currentPassword || !auth.newPassword) return returnError({ message: 'Missing credentials' });
    try {
        return returnResponse(
            await updateCredentials({
                email: auth.email,
                currentPassword: auth.currentPassword,
                newPassword: auth.newPassword,
            })
        );
    }
    catch (error: any) {
        return returnError(error);
    }
}
