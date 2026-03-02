/**
 * POST /api/v1/backup/import - multipart file (JSON backup) (bolt 008).
 */

import type { ExportSnapshot } from "@/application/backup/export-data";
import { importFromSnapshot } from "@/application/backup/import-data";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const contentType = request.headers.get("content-type") ?? "";
		if (!contentType.includes("multipart/form-data")) {
			return NextResponse.json(
				{
					code: "VALIDATION_ERROR",
					message: "Content-Type must be multipart/form-data with file",
				},
				{ status: 400 },
			);
		}
		const formData = await request.formData();
		const file = formData.get("file");
		if (!file || !(file instanceof File)) {
			return NextResponse.json(
				{
					code: "VALIDATION_ERROR",
					message: "Missing file in form field 'file'",
				},
				{ status: 400 },
			);
		}
		const text = await file.text();
		let snapshot: ExportSnapshot;
		try {
			snapshot = JSON.parse(text) as ExportSnapshot;
		} catch {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "Invalid JSON in backup file" },
				{ status: 400 },
			);
		}
		const result = await importFromSnapshot(snapshot);
		if ("ok" in result && result.ok) {
			return NextResponse.json({ ok: true, counts: result.counts });
		}
		if ("error" in result && result.error === "schema_version") {
			return NextResponse.json(
				{ code: "SCHEMA_VERSION_UNSUPPORTED", message: result.message },
				{ status: 400 },
			);
		}
		const msg =
			"error" in result && "message" in result
				? result.message
				: "Invalid backup data";
		return NextResponse.json(
			{ code: "VALIDATION_ERROR", message: msg },
			{ status: 400 },
		);
	} catch (e) {
		console.error("POST /api/v1/backup/import", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
