export type Identity = {
	id: string;
};

export type Verification = {
    token: string;
    user: Identity;
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
