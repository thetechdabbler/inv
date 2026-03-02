/**
 * Key derivation (PBKDF2) and field encryption (AES-256-GCM) for bolt 007.
 */

import {
	createCipheriv,
	createDecipheriv,
	pbkdf2Sync,
	randomBytes,
} from "node:crypto";

const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;
const PBKDF2_ITERATIONS = 100_000;

/**
 * Derive a 256-bit key from passphrase and salt (PBKDF2).
 */
export function deriveKey(passphrase: string, saltBase64: string): Buffer {
	const salt = Buffer.from(saltBase64, "base64");
	return pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, KEY_LEN, "sha256");
}

/**
 * Generate a new salt for PBKDF2 (base64).
 */
export function generateSalt(): string {
	return randomBytes(16).toString("base64");
}

/**
 * Encrypt plaintext with AES-256-GCM; returns base64(IV || authTag || ciphertext).
 */
export function encryptField(plaintext: Buffer, key: Buffer): string {
	const iv = randomBytes(IV_LEN);
	const cipher = createCipheriv("aes-256-gcm", key, iv, {
		authTagLength: TAG_LEN,
	});
	const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
	const tag = cipher.getAuthTag();
	return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

/**
 * Decrypt payload from encryptField. Returns plaintext buffer or null on failure.
 */
export function decryptField(
	ciphertextBase64: string,
	key: Buffer,
): Buffer | null {
	try {
		const buf = Buffer.from(ciphertextBase64, "base64");
		if (buf.length < IV_LEN + TAG_LEN) return null;
		const iv = buf.subarray(0, IV_LEN);
		const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
		const encrypted = buf.subarray(IV_LEN + TAG_LEN);
		const decipher = createDecipheriv("aes-256-gcm", key, iv, {
			authTagLength: TAG_LEN,
		});
		decipher.setAuthTag(tag);
		return Buffer.concat([decipher.update(encrypted), decipher.final()]);
	} catch {
		return null;
	}
}
