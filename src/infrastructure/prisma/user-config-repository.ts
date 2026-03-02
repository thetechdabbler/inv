/**
 * UserConfig repository (bolt 007). Singleton: at most one row.
 */

import { prisma } from "./client";

export interface UserConfigRow {
	id: string;
	passphraseHash: string;
	keyDerivationSalt: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export async function getUserConfig(): Promise<UserConfigRow | null> {
	const row = await prisma.userConfig.findFirst();
	if (!row) return null;
	return {
		id: row.id,
		passphraseHash: row.passphraseHash,
		keyDerivationSalt: row.keyDerivationSalt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

/**
 * Creates the single UserConfig row (passphrase hash + salt). Returns null if already configured.
 */
export async function setPassphrase(
	passphraseHash: string,
	keyDerivationSalt: string,
): Promise<UserConfigRow | null> {
	const existing = await prisma.userConfig.findFirst();
	if (existing) return null;
	const row = await prisma.userConfig.create({
		data: {
			id: "singleton",
			passphraseHash,
			keyDerivationSalt,
		},
	});
	return {
		id: row.id,
		passphraseHash: row.passphraseHash,
		keyDerivationSalt: row.keyDerivationSalt,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}
