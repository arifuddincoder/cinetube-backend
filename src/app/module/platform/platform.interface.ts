export interface ICreatePlatformPayload {
	name: string;
	logo?: string;
	website?: string;
}

export interface IUpdatePlatformPayload {
	name?: string;
	logo?: string;
	website?: string;
}
