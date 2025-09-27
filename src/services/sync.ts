import { getUnsynced, markSynced } from "../db/db";
import { useAppStore } from "../state/store";

// Placeholder REST calls
async function pushBatch(path: string, items: any[]) {
  // ...existing code...
  await new Promise((r) => setTimeout(r, 300)); // simulate latency
  return { ok: true };
}

export async function runAutoSync() {
  const { visits, followups } = await getUnsynced();
  if (!visits.length && !followups.length) return;
  const vres = visits.length ? await pushBatch("/api/visits/batch", visits) : { ok: true };
  if (vres.ok) await markSynced(visits.map((v: any) => v.id), "visits");
  const fres = followups.length ? await pushBatch("/api/followups/batch", followups) : { ok: true };
  if (fres.ok) await markSynced(followups.map((f: any) => f.id), "followups");
}

export async function runManualSync() {
  const setSyncing = useAppStore.getState().setSyncing;
  const setSynced = useAppStore.getState().setSynced;
  setSyncing(true);
  try {
    await runAutoSync();
    setSynced(true);
  } finally {
    setSyncing(false);
  }
}