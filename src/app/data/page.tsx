"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { apiFetch } from "@/lib/api";

const API_BASE = "/api/v1";
import { useRef, useState } from "react";
import { toast } from "sonner";

type ImportResult = {
	ok: boolean;
	counts?: { accounts: number; transactions: number; valuations: number };
};

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

function DataContent() {
	const [exporting, setExporting] = useState<"json" | "csv" | null>(null);
	const [importing, setImporting] = useState(false);
	const [lastExport, setLastExport] = useState<string | null>(null);
	const [lastImport, setLastImport] = useState<ImportResult | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function handleExport(format: "json" | "csv") {
		setExporting(format);
		try {
			const res = await apiFetch(`/api/v1/backup/export?format=${format}`);
			if (!res.ok) {
				const j = (await res.json()) as { message?: string };
				toast.error(j.message ?? "Export failed");
				return;
			}
			const dateStr = new Date().toISOString().slice(0, 10);
			if (format === "json") {
				const data = await res.json();
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				downloadBlob(blob, `investtrack-backup-${dateStr}.json`);
			} else {
				const blob = await res.blob();
				downloadBlob(blob, `investtrack-backup-${dateStr}.zip`);
			}
			setLastExport(new Date().toLocaleString());
			toast.success(
				`Backup exported as ${format === "json" ? "JSON" : "CSV ZIP"}`,
			);
		} catch {
			toast.error("Export failed");
		} finally {
			setExporting(null);
		}
	}

	async function handleImport(file: File) {
		setImporting(true);
		setLastImport(null);
		try {
			const formData = new FormData();
			formData.append("file", file);
			const res = await fetch(`${API_BASE}/backup/import`, {
				method: "POST",
				body: formData,
				credentials: "include",
			});
			const j = (await res.json()) as ImportResult & { message?: string };
			if (!res.ok) {
				toast.error(j.message ?? "Import failed");
				return;
			}
			setLastImport(j);
			toast.success("Backup imported successfully");
		} catch {
			toast.error("Import failed");
		} finally {
			setImporting(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	}

	function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.name.endsWith(".json")) {
			toast.error("Please select a JSON backup file");
			return;
		}
		if (
			!window.confirm(
				"Importing will replace ALL existing data (accounts, transactions, valuations). This action cannot be undone.\n\nAre you sure you want to continue?",
			)
		) {
			if (fileInputRef.current) fileInputRef.current.value = "";
			return;
		}
		handleImport(file);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-800">
					Import &amp; Export Data
				</h1>
				<p className="text-sm text-slate-400 mt-1">
					Back up your portfolio data or restore from a previous backup
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Export section */}
				<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
					<div className="border-b border-slate-200 px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
								<svg
									className="h-5 w-5 text-emerald-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Export</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
									/>
								</svg>
							</div>
							<div>
								<h2 className="font-semibold text-slate-800">
									Export Database
								</h2>
								<p className="text-xs text-slate-400">
									Download a full backup of your data
								</p>
							</div>
						</div>
					</div>
					<div className="p-6 space-y-4">
						<p className="text-sm text-slate-600">
							Export all accounts, transactions, and valuations. Choose your
							preferred format:
						</p>
						<div className="space-y-3">
							<button
								type="button"
								onClick={() => handleExport("json")}
								disabled={exporting !== null}
								className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3.5 text-left hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold">
										{}
									</span>
									<div>
										<p className="text-sm font-medium text-slate-700">
											JSON Backup
										</p>
										<p className="text-xs text-slate-400">
											Single file, ideal for restoring later
										</p>
									</div>
								</div>
								{exporting === "json" ? (
									<span className="text-xs text-indigo-500 font-medium">
										Exporting&hellip;
									</span>
								) : (
									<svg
										className="h-5 w-5 text-slate-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<title>Download</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								)}
							</button>

							<button
								type="button"
								onClick={() => handleExport("csv")}
								disabled={exporting !== null}
								className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3.5 text-left hover:border-indigo-300 hover:bg-indigo-50/50 disabled:opacity-50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 text-xs font-bold">
										CSV
									</span>
									<div>
										<p className="text-sm font-medium text-slate-700">
											CSV ZIP Archive
										</p>
										<p className="text-xs text-slate-400">
											Spreadsheet-friendly, one file per table
										</p>
									</div>
								</div>
								{exporting === "csv" ? (
									<span className="text-xs text-indigo-500 font-medium">
										Exporting&hellip;
									</span>
								) : (
									<svg
										className="h-5 w-5 text-slate-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<title>Download</title>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								)}
							</button>
						</div>

						{lastExport && (
							<p className="text-xs text-slate-400 pt-1">
								Last export: {lastExport}
							</p>
						)}
					</div>
				</div>

				{/* Import section */}
				<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
					<div className="border-b border-slate-200 px-6 py-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
								<svg
									className="h-5 w-5 text-amber-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Import</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
									/>
								</svg>
							</div>
							<div>
								<h2 className="font-semibold text-slate-800">
									Import Database
								</h2>
								<p className="text-xs text-slate-400">
									Restore from a JSON backup file
								</p>
							</div>
						</div>
					</div>
					<div className="p-6 space-y-4">
						<div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
							<svg
								className="mx-auto h-10 w-10 text-slate-300"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<title>Upload file</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<p className="mt-2 text-sm text-slate-600">
								{importing ? "Importing..." : "Select a JSON backup file"}
							</p>
							<p className="text-xs text-slate-400 mt-1">
								Only .json files exported from InvestTrack are supported
							</p>
							<label
								htmlFor="import-file"
								className={`mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-colors cursor-pointer ${
									importing
										? "bg-slate-300 text-slate-500"
										: "bg-indigo-600 text-white hover:bg-indigo-700"
								}`}
							>
								{importing ? "Importing\u2026" : "Choose File"}
								<input
									id="import-file"
									ref={fileInputRef}
									type="file"
									accept=".json"
									disabled={importing}
									onChange={onFileSelect}
									className="sr-only"
								/>
							</label>
						</div>

						<div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
							<div className="flex gap-2">
								<svg
									className="h-5 w-5 text-amber-600 shrink-0 mt-0.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<title>Warning</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
								<div>
									<p className="text-sm font-medium text-amber-800">Warning</p>
									<p className="text-xs text-amber-700 mt-0.5">
										Importing will replace all existing accounts, transactions,
										and valuations. Export your current data first if you want
										to keep it.
									</p>
								</div>
							</div>
						</div>

						{lastImport?.ok && lastImport.counts && (
							<div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
								<p className="text-sm font-medium text-emerald-800">
									Import successful
								</p>
								<div className="mt-2 flex gap-4 text-xs text-emerald-700">
									<span>{lastImport.counts.accounts} accounts</span>
									<span>{lastImport.counts.transactions} transactions</span>
									<span>{lastImport.counts.valuations} valuations</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function DataPage() {
	return (
		<RequireAuth>
			<DataContent />
		</RequireAuth>
	);
}
