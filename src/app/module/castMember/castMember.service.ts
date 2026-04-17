import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateCastMemberPayload, IUpdateCastMemberPayload } from "./castMember.interface";

const getAllCastMembers = async (query: IQueryParams) => {
	const result = await new QueryBuilder(prisma.castMember, query, {
		searchableFields: ["name"],
		filterableFields: [],
	})
		.where({ isDeleted: false })
		.search()
		.filter()
		.sort()
		.paginate()
		.execute();

	return result;
};

const getCastMemberById = async (id: string) => {
	const castMember = await prisma.castMember.findUnique({
		where: { id, isDeleted: false },
		include: {
			movies: {
				include: {
					movie: {
						select: {
							id: true,
							title: true,
							posterImage: true,
							releaseYear: true,
						},
					},
				},
			},
		},
	});

	if (!castMember) {
		throw new AppError(status.NOT_FOUND, "Cast member not found");
	}

	return castMember;
};

const createCastMember = async (payload: ICreateCastMemberPayload) => {
	const isCastMemberExist = await prisma.castMember.findUnique({
		where: { name: payload.name },
	});

	if (isCastMemberExist) {
		throw new AppError(status.CONFLICT, "Cast member already exists");
	}

	const castMember = await prisma.castMember.create({
		data: {
			name: payload.name,
		},
	});

	return castMember;
};

const updateCastMember = async (id: string, payload: IUpdateCastMemberPayload) => {
	const isCastMemberExist = await prisma.castMember.findUnique({
		where: { id },
	});

	if (!isCastMemberExist) {
		throw new AppError(status.NOT_FOUND, "Cast member not found");
	}

	const updatedData: { name?: string } = {};

	if (payload.name) {
		updatedData.name = payload.name;
	}

	const castMember = await prisma.castMember.update({
		where: { id },
		data: updatedData,
	});

	return castMember;
};

const deleteCastMember = async (id: string) => {
	const isCastMemberExist = await prisma.castMember.findUnique({
		where: { id, isDeleted: false },
	});

	if (!isCastMemberExist) {
		throw new AppError(status.NOT_FOUND, "Cast member not found");
	}

	const castMember = await prisma.castMember.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
		},
	});

	return castMember;
};
const hardDeleteCastMember = async (id: string) => {
	const isCastMemberExist = await prisma.castMember.findUnique({
		where: { id },
	});

	if (!isCastMemberExist) {
		throw new AppError(status.NOT_FOUND, "Cast member not found");
	}

	if (!isCastMemberExist.isDeleted) {
		throw new AppError(status.BAD_REQUEST, "Cast member must be soft deleted before permanent deletion");
	}

	const castMember = await prisma.castMember.delete({
		where: { id },
	});

	return castMember;
};
export const CastMemberService = {
	getAllCastMembers,
	getCastMemberById,
	createCastMember,
	updateCastMember,
	deleteCastMember,
	hardDeleteCastMember,
};
