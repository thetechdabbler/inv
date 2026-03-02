/**
 * Iron-session config and types (bolt 007). Session holds optional derived key for decryption.
 */

import { type SessionOptions, getIronSession } from "iron-session";

const secret = process.env.SESSION_SECRET;
if (!secret || secret.length < 32) {
	console.warn(
		"SESSION_SECRET should be set and at least 32 characters for production",
	);
}

export const SESSION_OPTIONS: SessionOptions = {
	password: secret ?? "dev-secret-min-32-chars-required!!",
	cookieName: "inv_session",
	cookieOptions: {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		maxAge: 60 * 60 * 24, // 24h
	},
};

export interface SessionData {
	keyBase64?: string; // derived encryption key (base64) when authenticated
}
