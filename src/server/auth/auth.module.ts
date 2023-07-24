export type Identity = {
	email: string;
	user_id: string;
};

export type Verification = {
	token: string;
};

export type Credential = {
	email: string;
	password: string;
};

export type UpdateCredential = {
    email: string;
    currentPassword: string;
    newPassword: string;
};
