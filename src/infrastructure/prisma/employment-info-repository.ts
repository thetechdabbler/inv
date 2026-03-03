import { prisma } from "./client";

export interface EmploymentInfo {
	id: string;
	accountId: string;
	employerName: string | null;
	basicSalaryInr: number | null;
	vpfAmountInr: number | null;
	joiningDate: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

function toDomain(row: {
	id: string;
	accountId: string;
	employerName: string | null;
	basicSalaryInr: number | null;
	vpfAmountInr: number | null;
	joiningDate: Date | null;
	createdAt: Date;
	updatedAt: Date;
}): EmploymentInfo {
	return {
		id: row.id,
		accountId: row.accountId,
		employerName: row.employerName,
		basicSalaryInr: row.basicSalaryInr,
		vpfAmountInr: row.vpfAmountInr,
		joiningDate: row.joiningDate,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export async function findByAccountId(
	accountId: string,
): Promise<EmploymentInfo | null> {
	const row = await prisma.employmentInfo.findUnique({
		where: { accountId },
	});
	if (!row) return null;
	return toDomain(row);
}

export async function upsertForAccount(input: {
	accountId: string;
	employerName?: string | null;
	basicSalaryInr?: number | null;
	vpfAmountInr?: number | null;
	joiningDate?: Date | null;
}): Promise<EmploymentInfo> {
	const existing = await prisma.employmentInfo.findUnique({
		where: { accountId: input.accountId },
	});
	const row = existing
		? await prisma.employmentInfo.update({
				where: { accountId: input.accountId },
				data: {
					...(input.employerName !== undefined && {
						employerName: input.employerName,
					}),
					...(input.basicSalaryInr !== undefined && {
						basicSalaryInr: input.basicSalaryInr,
					}),
					...(input.vpfAmountInr !== undefined && {
						vpfAmountInr: input.vpfAmountInr,
					}),
					...(input.joiningDate !== undefined && {
						joiningDate: input.joiningDate,
					}),
				},
			})
		: await prisma.employmentInfo.create({
				data: {
					accountId: input.accountId,
					employerName: input.employerName ?? null,
					basicSalaryInr: input.basicSalaryInr ?? null,
					vpfAmountInr: input.vpfAmountInr ?? null,
					joiningDate: input.joiningDate ?? null,
				},
			});
	return toDomain({
		id: row.id,
		accountId: row.accountId,
		employerName: row.employerName,
		basicSalaryInr: row.basicSalaryInr,
		vpfAmountInr: row.vpfAmountInr,
		joiningDate: row.joiningDate,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	});
}

