/**
 * Verify passphrase and derive session key (bolt 007 story 002).
 */

import * as userConfigRepo from "@/infrastructure/prisma/user-config-repository";
import { deriveKey } from "@/lib/crypto";
import * as bcrypt from "bcrypt";

export type VerifyResult =
	| { ok: true; keyBase64: string }
	| { error: "not_configured" }
	| { error: "invalid_passphrase" };

export async function verifyPassphrase(
	passphrase: string,
): Promise<VerifyResult> {
	const config = await userConfigRepo.getUserConfig();
	if (!config) return { error: "not_configured" };
	if (!config.keyDerivationSalt) return { error: "not_configured" };
	const match = await bcrypt.compare(passphrase, config.passphraseHash);
	if (!match) return { error: "invalid_passphrase" };
	const key = deriveKey(passphrase, config.keyDerivationSalt);
	return { ok: true, keyBase64: key.toString("base64") };
}
