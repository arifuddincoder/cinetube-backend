export interface IUpdateUserPayload {
	name?: string;
	image?: string;
	imagePublicId?: string;
}

export interface IChangeEmailPayload {
	newEmail: string;
}

export interface IChangeUserStatusPayload {
	userId: string;
	status: string;
}

export interface IChangeUserRolePayload {
	userId: string;
	role: string;
}
