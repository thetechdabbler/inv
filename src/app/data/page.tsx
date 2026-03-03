"use client";

import { PageTransition } from "@/components/PageTransition";
import { RequireAuth } from "@/components/RequireAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import {
	AlertTriangle,
	CheckCircle2,
	Download,
	FileJson,
	FileSpreadsheet,
	Loader2,
	Upload,
	UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type ImportResult = {
	ok: boolean;
	counts?: { accounts: number; transactions: number; valuations: number };
};

const API_BASE = "/api/v1";

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
	const [dragOver, setDragOver] = useState(false);
	const [importConfirmOpen, setImportConfirmOpen] = useState(false);
	const [pendingFile, setPendingFile] = useState<File | null>(null);
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

	function processFile(file: File) {
		if (!file.name.endsWith(".json")) {
			toast.error("Please select a JSON backup file");
			return;
		}
		setPendingFile(file);
		setImportConfirmOpen(true);
	}

	function onConfirmImport() {
		if (pendingFile) {
			void handleImport(pendingFile);
			setPendingFile(null);
			setImportConfirmOpen(false);
			if (fileInputRef.current) fileInputRef.current.value = "";
		}
	}

	function onCancelImport() {
		setPendingFile(null);
		setImportConfirmOpen(false);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		processFile(file);
	}

	function onDrop(e: React.DragEvent) {
		e.preventDefault();
		setDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file) processFile(file);
	}

	function onDropzoneKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			fileInputRef.current?.click();
		}
	}

	return (
		<PageTransition className="space-y-6">
			<Dialog
				open={importConfirmOpen}
				onOpenChange={(open) => !open && onCancelImport()}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							Confirm import
						</DialogTitle>
						<DialogDescription>
							Importing will replace ALL existing data (accounts, transactions,
							valuations). This action cannot be undone. Are you sure you want to
							continue?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="outline"
							onClick={() => {
								void handleExport("json");
							}}
						>
							Download backup first
						</Button>
						<Button variant="outline" onClick={onCancelImport}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={onConfirmImport}>
							Confirm
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div>
				<h1 className="text-2xl font-bold text-foreground">
					Import &amp; Export Data
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Back up your portfolio data or restore from a previous backup
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="dark:glow-border">
					<CardHeader className="flex-row items-center gap-3 space-y-0">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
							<Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
						</div>
						<div>
							<CardTitle>Export Database</CardTitle>
							<CardDescription>
								Download a full backup of your data
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Export all accounts, transactions, and valuations. Choose your
							preferred format:
						</p>
						<div className="space-y-3">
							<button
								type="button"
								onClick={() => handleExport("json")}
								disabled={exporting !== null}
								className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3.5 text-left hover:border-primary/50 hover:bg-accent disabled:opacity-50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
										<FileJson className="h-4 w-4 text-primary" />
									</span>
									<div>
										<p className="text-sm font-medium text-foreground">
											JSON Backup
										</p>
										<p className="text-xs text-muted-foreground">
											Single file, ideal for restoring later
										</p>
									</div>
								</div>
								{exporting === "json" ? (
									<Loader2 className="h-4 w-4 animate-spin text-primary" />
								) : (
									<Download className="h-4 w-4 text-muted-foreground" />
								)}
							</button>

							<button
								type="button"
								onClick={() => handleExport("csv")}
								disabled={exporting !== null}
								className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-3.5 text-left hover:border-primary/50 hover:bg-accent disabled:opacity-50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
										<FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
									</span>
									<div>
										<p className="text-sm font-medium text-foreground">
											CSV ZIP Archive
										</p>
										<p className="text-xs text-muted-foreground">
											Spreadsheet-friendly, one file per table
										</p>
									</div>
								</div>
								{exporting === "csv" ? (
									<Loader2 className="h-4 w-4 animate-spin text-primary" />
								) : (
									<Download className="h-4 w-4 text-muted-foreground" />
								)}
							</button>
						</div>

						{lastExport && (
							<p className="text-xs text-muted-foreground pt-1">
								Last export: {lastExport}
							</p>
						)}
					</CardContent>
				</Card>

				<Card className="dark:glow-border">
					<CardHeader className="flex-row items-center gap-3 space-y-0">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
							<Upload className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						</div>
						<div>
							<CardTitle>Import Database</CardTitle>
							<CardDescription>Restore from a JSON backup file</CardDescription>
						</div>
					</CardHeader>
					<CardContent className="space-y-4">
						<div
							onDragOver={(e) => {
								e.preventDefault();
								setDragOver(true);
							}}
							onDragLeave={() => setDragOver(false)}
							onDrop={onDrop}
							onKeyDown={onDropzoneKeyDown}
							tabIndex={0}
							className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
								dragOver
									? "border-primary bg-primary/5"
									: "border-border bg-muted/50"
							}`}
						>
							<UploadCloud
								className={`mx-auto h-10 w-10 ${
									dragOver ? "text-primary" : "text-muted-foreground/50"
								}`}
							/>
							<p className="mt-2 text-sm text-foreground">
								{importing
									? "Importing..."
									: "Drop a JSON backup file here, or click below"}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								Only .json files exported from InvestTrack are supported
							</p>
							<Button
								variant={importing ? "secondary" : "default"}
								className="mt-4"
								disabled={importing}
								onClick={() => fileInputRef.current?.click()}
							>
								{importing ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Importing…
									</>
								) : (
									"Choose File"
								)}
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								accept=".json"
								disabled={importing}
								onChange={onFileSelect}
								className="sr-only"
							/>
						</div>

						<Alert className="border-amber-500/50 bg-amber-500/10">
							<AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
							<AlertTitle className="text-amber-800 dark:text-amber-300">
								Warning
							</AlertTitle>
							<AlertDescription className="text-amber-700 dark:text-amber-400">
								Importing will replace all existing accounts, transactions, and
								valuations. Export your current data first if you want to keep
								it.
							</AlertDescription>
						</Alert>

						{lastImport?.ok && lastImport.counts && (
							<Alert className="border-emerald-500/50 bg-emerald-500/10">
								<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
								<AlertTitle className="text-emerald-800 dark:text-emerald-300">
									Import successful
								</AlertTitle>
								<AlertDescription className="text-emerald-700 dark:text-emerald-400">
									{lastImport.counts.accounts} accounts &middot;{" "}
									{lastImport.counts.transactions} transactions &middot;{" "}
									{lastImport.counts.valuations} valuations
								</AlertDescription>
							</Alert>
						)}
					</CardContent>
				</Card>
			</div>
		</PageTransition>
	);
}

export default function DataPage() {
	return (
		<RequireAuth>
			<DataContent />
		</RequireAuth>
	);
}
