import {
	decryptField,
	deriveKey,
	encryptField,
	generateSalt,
} from "@/lib/crypto";
/**
 * Unit tests for bolt 007 crypto: key derivation, encrypt/decrypt round-trip.
 */
import { describe, expect, it } from "vitest";

const IV_LEN = 12;

describe("deriveKey", () => {
	it("should derive same key for same passphrase and salt", () => {
		const salt = generateSalt();
		const key1 = deriveKey("my-passphrase", salt);
		const key2 = deriveKey("my-passphrase", salt);
		expect(key1.equals(key2)).toBe(true);
	});

	it("should derive different keys for different salts", () => {
		const salt1 = generateSalt();
		const salt2 = generateSalt();
		const key1 = deriveKey("same-pass", salt1);
		const key2 = deriveKey("same-pass", salt2);
		expect(key1.equals(key2)).toBe(false);
	});
});

describe("encryptField / decryptField", () => {
	it("should round-trip plaintext", () => {
		const key = Buffer.alloc(32, 1);
		const plain = Buffer.from("12345", "utf8");
		const encrypted = encryptField(plain, key);
		expect(encrypted).toBeTruthy();
		expect(typeof encrypted).toBe("string");
		const decrypted = decryptField(encrypted, key);
		expect(decrypted).not.toBeNull();
		expect(Buffer.compare(decrypted!, plain)).toBe(0);
	});

	it("should produce different ciphertext each time (random IV)", () => {
		const key = Buffer.alloc(32, 2);
		const plain = Buffer.from("same", "utf8");
		const enc1 = encryptField(plain, key);
		const enc2 = encryptField(plain, key);
		expect(enc1).not.toBe(enc2);
		expect(decryptField(enc1, key)).toEqual(decryptField(enc2, key));
	});

	it("should return null for wrong key", () => {
		const key = Buffer.alloc(32, 3);
		const plain = Buffer.from("secret", "utf8");
		const encrypted = encryptField(plain, key);
		const wrongKey = Buffer.alloc(32, 99);
		expect(decryptField(encrypted, wrongKey)).toBeNull();
	});

	it("should return null for tampered ciphertext (auth tag invalid)", () => {
		const key = Buffer.alloc(32, 4);
		const plain = Buffer.from("data", "utf8");
		const encrypted = encryptField(plain, key);
		const buf = Buffer.from(encrypted, "base64");
		buf[IV_LEN + 1] ^= 0xff;
		const tampered = buf.toString("base64");
		expect(decryptField(tampered, key)).toBeNull();
	});
});
