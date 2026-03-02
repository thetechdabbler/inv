/**
 * GET /api/v1/backup/export?format=json|csv (bolt 008).
 */

import {
	type ExportFormat,
	exportAsCsvZip,
	exportAsJson,
} from "@/application/backup/export-data";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const format = (
			url.searchParams.get("format") ?? "json"
		).toLowerCase() as ExportFormat;
		if (format !== "json" && format !== "csv") {
			return NextResponse.json(
				{ code: "VALIDATION_ERROR", message: "format must be json or csv" },
				{ status: 400 },
			);
		}
		if (format === "json") {
			const snapshot = await exportAsJson();
			return NextResponse.json(snapshot);
		}
		const zipBuffer = await exportAsCsvZip();
		const filename = `backup-${new Date().toISOString().slice(0, 10)}.zip`;
		return new NextResponse(new Uint8Array(zipBuffer), {
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (e) {
		console.error("GET /api/v1/backup/export", e);
		return NextResponse.json(
			{ code: "INTERNAL_ERROR", message: "Internal server error" },
			{ status: 500 },
		);
	}
}
