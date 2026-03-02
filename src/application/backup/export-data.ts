/**
 * Export all data as JSON or CSV ZIP (bolt 008).
 */

import { prisma } from "@/infrastructure/prisma/client";
import JSZip from "jszip";

const SCHEMA_VERSION = 1;

export type ExportFormat = "json" | "csv";

export interface ExportSnapshot {
	accounts: Array<{
		id: string;
		type: string;
		name: string;
		description: string | null;
		initialBalancePaise: number;
		createdAt: string;
		updatedAt: string;
	}>;
	transactions: Array<{
		id: string;
		accountId: string;
		date: string;
		amountPaise: number;
		type: string;
		description: string | null;
		createdAt: string;
	}>;
	valuations: Array<{
		id: string;
		accountId: string;
		date: string;
		valuePaise: number;
		createdAt: string;
	}>;
	meta: { exportedAt: string; schemaVersion: number };
}

export async function exportAsJson(): Promise<ExportSnapshot> {
	const [accounts, transactions, valuations] = await Promise.all([
		prisma.account.findMany({ orderBy: { createdAt: "asc" } }),
		prisma.transaction.findMany({ orderBy: { date: "asc" } }),
		prisma.valuation.findMany({ orderBy: { date: "asc" } }),
	]);
	const exportedAt = new Date().toISOString();
	return {
		accounts: accounts.map((a) => ({
			id: a.id,
			type: a.type,
			name: a.name,
			description: a.description,
			initialBalancePaise: a.initialBalancePaise,
			createdAt: a.createdAt.toISOString(),
			updatedAt: a.updatedAt.toISOString(),
		})),
		transactions: transactions.map((t) => ({
			id: t.id,
			accountId: t.accountId,
			date: t.date.toISOString().slice(0, 10),
			amountPaise: t.amountPaise,
			type: t.type,
			description: t.description,
			createdAt: t.createdAt.toISOString(),
		})),
		valuations: valuations.map((v) => ({
			id: v.id,
			accountId: v.accountId,
			date: v.date.toISOString().slice(0, 10),
			valuePaise: v.valuePaise,
			createdAt: v.createdAt.toISOString(),
		})),
		meta: { exportedAt, schemaVersion: SCHEMA_VERSION },
	};
}

function toCsvRow(values: (string | number)[]): string {
	return values
		.map((v) => {
			const s = String(v);
			if (s.includes(",") || s.includes('"') || s.includes("\n")) {
				return `"${s.replace(/"/g, '""')}"`;
			}
			return s;
		})
		.join(",");
}

export async function exportAsCsvZip(): Promise<Buffer> {
	const snapshot = await exportAsJson();
	const zip = new JSZip();
	const headers = {
		accounts: [
			"id",
			"type",
			"name",
			"description",
			"initialBalancePaise",
			"createdAt",
			"updatedAt",
		],
		transactions: [
			"id",
			"accountId",
			"date",
			"amountPaise",
			"type",
			"description",
			"createdAt",
		],
		valuations: ["id", "accountId", "date", "valuePaise", "createdAt"],
	};
	const accountRows = snapshot.accounts.map((a) =>
		toCsvRow([
			a.id,
			a.type,
			a.name,
			a.description ?? "",
			a.initialBalancePaise,
			a.createdAt,
			a.updatedAt,
		]),
	);
	zip.file(
		"accounts.csv",
		[headers.accounts.join(","), ...accountRows].join("\n"),
	);
	const txRows = snapshot.transactions.map((t) =>
		toCsvRow([
			t.id,
			t.accountId,
			t.date,
			t.amountPaise,
			t.type,
			t.description ?? "",
			t.createdAt,
		]),
	);
	zip.file(
		"transactions.csv",
		[headers.transactions.join(","), ...txRows].join("\n"),
	);
	const valRows = snapshot.valuations.map((v) =>
		toCsvRow([v.id, v.accountId, v.date, v.valuePaise, v.createdAt]),
	);
	zip.file(
		"valuations.csv",
		[headers.valuations.join(","), ...valRows].join("\n"),
	);
	zip.file("meta.json", JSON.stringify(snapshot.meta));
	const blob = await zip.generateAsync({ type: "nodebuffer" });
	return Buffer.from(blob);
}
