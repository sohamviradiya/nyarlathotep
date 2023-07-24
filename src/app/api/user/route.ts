import { STATUS_CODES } from '@/server/response/response.module';
import { returnResponse } from '@/server/response/response.util';
import { searchUsersByName } from '@/server/user/user.service';
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const search_string = request.nextUrl.searchParams.get('query_string');
    if (!search_string) return returnResponse({ code: STATUS_CODES.BAD_REQUEST, message: 'No query string provided' });
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    return returnResponse(await searchUsersByName(search_string, limit));
};


