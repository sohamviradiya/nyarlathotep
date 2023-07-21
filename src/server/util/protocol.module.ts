export enum STATUS_CODE {
	OK = 200,
	BAD_REQUEST = 400,
	NOT_FOUND = 404,
	UNAUTHORIZED = 401,
	FORBIDDEN = 403,
	INTERNAL_ERROR = 500,
}

export type Protocol = {
	code: STATUS_CODE;
	message: string;
	data?: any;
};
