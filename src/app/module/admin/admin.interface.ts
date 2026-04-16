export interface ICreateAdminPayload {
	name: string;
	email: string;
	password: string;
}

export interface IUpdateAdminPayload {
	name?: string;
	image?: string;
}

export interface IChangeUserStatusPayload {
	userId: string;
	status: string;
}

export interface IChangeUserRolePayload {
	userId: string;
	role: string;
}
