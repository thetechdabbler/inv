/**
 * Delete account use case (cascade delete; requires confirm flag at API layer).
 * Logs audit (bolt 008).
 */

import * as accountRepo from "@/infrastructure/prisma/account-repository";
import { createAuditLog } from "@/infrastructure/prisma/audit-log-repository";

export async function deleteAccount(id: string): Promise<boolean> {
	const account = await accountRepo.findAccountById(id);
	if (!account) return false;
	const oldSnapshot = JSON.stringify({
		id: account.id,
		type: account.type,
		name: account.name,
	});
	const deleted = await accountRepo.deleteAccount(id);
	if (deleted)
		await createAuditLog("account", id, "deleted", oldSnapshot, null);
	return deleted;
}
