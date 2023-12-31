export enum STATUS_CODES {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    INTERNAL_ERROR = 500,
}

export type Service_Response<T> = {
    code: STATUS_CODES;
    message: string;
    data?: T;
};
