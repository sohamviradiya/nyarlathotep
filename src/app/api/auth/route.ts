import { addCredentials, deleteCredentials, generateClientToken, getUserIDFromToken, updateCredentials } from '@/server/auth/auth.service';
import { extractToken } from '@/server/auth/auth.util';
import { STATUS_CODES } from '@/server/response/response.module';
import { returnResponse } from '@/server/response/response.util';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const token = extractToken(request.headers);
    if (!token) return returnResponse({ code: STATUS_CODES.BAD_REQUEST, message: 'Missing token' });
    return returnResponse(await getUserIDFromToken(token));
};

export async function POST(request: NextRequest) {
    const { auth } = await request.json();
    if (!auth.email || !auth.password) return returnResponse({ code: STATUS_CODES.BAD_REQUEST, message: 'Missing email or password' });
    return returnResponse(
        await addCredentials({
            email: auth.email,
            password: auth.password,
        })
    );
}

export async function PUT(request: NextRequest) {
    const { auth } = await request.json();
    if (!auth.email || !auth.password) return returnResponse({ code: STATUS_CODES.BAD_REQUEST, message: 'Missing email or password' });
    return returnResponse(
        await generateClientToken({
            email: auth.email,
            password: auth.password,
        }) 
    );
};

export async function PATCH(request: NextRequest) {
    const { auth } = await request.json();
    if (!auth.email || !auth.currentPassword || !auth.newPassword) return returnResponse({ code: STATUS_CODES.BAD_REQUEST, message: 'Missing email or password' });
    return returnResponse(
        await updateCredentials({
            email: auth.email,
            currentPassword: auth.currentPassword,
            newPassword: auth.newPassword,
        })
    );
}
export async function DELETE(request: NextRequest) {
    const token = extractToken(request.headers);
    if (!token) return returnResponse({ code: STATUS_CODES.BAD_REQUEST, message: 'Missing token' });
    return returnResponse(await deleteCredentials(token));
}
