/**
 * Setup passphrase on first use (bolt 007 story 001).
 */

import * as userConfigRepo from "@/infrastructure/prisma/user-config-repository";
import { generateSalt } from "@/lib/crypto";
import * as bcrypt from "bcrypt";

const BCRYPT_ROUNDS = 12;
const MIN_PASSPHRASE_LENGTH = 8;

export type SetupResult =
	| { ok: true }
	| { error: "validation"; message: string }
	| { error: "already_configured" };

export async function setupPassphrase(
	passphrase: string,
): Promise<SetupResult> {
	const trimmed = passphrase?.trim() ?? "";
	if (trimmed.length < MIN_PASSPHRASE_LENGTH) {
		return {
			error: "validation",
			message: "Passphrase must be at least 8 characters",
		};
	}
	const hash = await bcrypt.hash(trimmed, BCRYPT_ROUNDS);
	const salt = generateSalt();
	const row = await userConfigRepo.setPassphrase(hash, salt);
	if (!row) return { error: "already_configured" };
	return { ok: true };
}
