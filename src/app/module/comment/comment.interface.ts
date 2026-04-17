export interface ICreateCommentPayload {
	reviewId: string;
	content: string;
	parentId?: string;
}

export interface IUpdateCommentPayload {
	content: string;
}
