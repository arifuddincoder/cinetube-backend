export interface ICreateAdminPayload {
	name: string;
	email: string;
	password: string;
}

export interface IUpdateAdminPayload {
	name?: string;
	image?: string;
}
