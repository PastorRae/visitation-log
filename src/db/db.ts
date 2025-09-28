import * as SQLite from "expo-sqlite";
import { VisitRecord } from "../types";
import dayjs from "dayjs";

let db: SQLite.SQLiteDatabase | null = null;

export const getDb = () => {
  if (!db) throw new Error("DB not initialized");
  return db;
};

export async function initDb() {
  db = await SQLite.openDatabaseAsync("visitation.db");
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS churches (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      church_id TEXT,
      affiliation TEXT,
      discipleship_status TEXT
    );

    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY NOT NULL,
      start_time INTEGER,
      end_time INTEGER,
      visit_date INTEGER NOT NULL,
      pastor_email TEXT NOT NULL,
      pastor_name TEXT NOT NULL,
      member_id TEXT,
      member_first TEXT,
      member_last TEXT,
      church_id TEXT,
      visit_type TEXT NOT NULL,
      category TEXT NOT NULL,
      comments TEXT,
      address TEXT,
      lat REAL,
      lng REAL,
      next_visit_date INTEGER,
      followup_actions TEXT,
      priority TEXT,
      scripture_refs TEXT,
      prayer_requests TEXT,
      resources TEXT,
      synced INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS followups (
      id TEXT PRIMARY KEY NOT NULL,
      visit_id TEXT NOT NULL,
      due_date INTEGER NOT NULL,
      actions TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS church_profiles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      pastor_name TEXT NOT NULL,
      pastor_email TEXT NOT NULL,
      community_service_hours_target INTEGER NOT NULL,
      small_groups_target INTEGER NOT NULL,
      digital_evangelism_reach_target INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS kpi_dashboards (
      id TEXT PRIMARY KEY NOT NULL,
      church_id TEXT NOT NULL,
      community_service_hours INTEGER NOT NULL,
      small_groups_per_church INTEGER NOT NULL,
      digital_evangelism_reach INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      visit_id TEXT NOT NULL,
      activity_metadata TEXT NOT NULL,
      notes TEXT NOT NULL,
      metrics TEXT NOT NULL
    );
  `);
  // Seed a default church for testing
  await db.runAsync(
    "INSERT OR IGNORE INTO churches (id, name) VALUES (?, ?)",
    "slc-bb-main",
    "South Leeward Conference - Barbados"
  );
}

export async function insertVisit(v: VisitRecord) {
  const d = getDb();
  await d.runAsync(
    `INSERT INTO visits
    (id,start_time,end_time,visit_date,pastor_email,pastor_name,member_id,member_first,member_last,church_id,visit_type,category,comments,address,lat,lng,next_visit_date,followup_actions,priority,scripture_refs,prayer_requests,resources,synced,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    v.id,
    v.start_time ?? null,
    v.end_time ?? null,
    v.visit_date,
    v.pastor_email,
    v.pastor_name,
    v.member_id ?? null,
    v.member_first ?? null,
    v.member_last ?? null,
    v.church_id ?? null,
    v.visit_type,
    v.category,
    v.comments ?? null,
    v.address ?? null,
    v.lat ?? null,
    v.lng ?? null,
    v.next_visit_date ?? null,
    v.followup_actions ?? null,
    v.priority ?? null,
    v.scripture_refs ?? null,
    v.prayer_requests ?? null,
    v.resources ?? null,
    v.synced ?? 0,
    v.updated_at
  );
}

export async function getTodayVisits(churchId?: string): Promise<VisitRecord[]> {
  const d = getDb();
  const start = dayjs().startOf("day").valueOf();
  const end = dayjs().endOf("day").valueOf();
  const params: any[] = [start, end];
  let where = "visit_date BETWEEN ? AND ?";
  if (churchId) {
    where += " AND (church_id = ? OR church_id IS NULL)";
    params.push(churchId);
  }
  const result = await d.getAllAsync<VisitRecord>(
    `SELECT * FROM visits WHERE ${where} ORDER BY visit_date DESC`,
    ...params
  );
  return result;
}

export async function getRecentVisits(days = 7, churchId?: string): Promise<VisitRecord[]> {
  const d = getDb();
  const start = dayjs().subtract(days, "day").startOf("day").valueOf();
  const params: any[] = [start];
  let where = "visit_date >= ?";
  if (churchId) {
    where += " AND (church_id = ? OR church_id IS NULL)";
    params.push(churchId);
  }
  const result = await d.getAllAsync<VisitRecord>(
    `SELECT * FROM visits WHERE ${where} ORDER BY visit_date DESC`,
    ...params
  );
  return result;
}

export async function countOverdueFollowups(now = Date.now(), churchId?: string): Promise<number> {
  const d = getDb();
  let where = "due_date < ? AND status != 'done'";
  const params: any[] = [now];
  if (churchId) {
    where += " AND visit_id IN (SELECT id FROM visits WHERE church_id = ?)";
    params.push(churchId);
  }
  const row = await d.getFirstAsync<{ c: number }>(
    `SELECT COUNT(*) as c FROM followups WHERE ${where}`,
    ...params
  );
  return row?.c ?? 0;
}

export async function getUnsynced() {
  const d = getDb();
  const visits = await d.getAllAsync("SELECT * FROM visits WHERE synced = 0");
  const followups = await d.getAllAsync("SELECT * FROM followups WHERE synced = 0");
  return { visits, followups };
}

export async function markSynced(ids: string[], table: "visits" | "followups") {
  const d = getDb();
  if (!ids.length) return;
  const placeholders = ids.map(() => "?").join(",");
  await d.runAsync(`UPDATE ${table} SET synced = 1 WHERE id IN (${placeholders})`, ...ids);
}

// Additional methods for PastoralCare Pro integration
export async function getUnsyncedVisits(): Promise<VisitRecord[]> {
  const d = getDb();
  return await d.getAllAsync<VisitRecord>("SELECT * FROM visits WHERE synced = 0");
}

export async function getUnsyncedFollowups(): Promise<any[]> {
  const d = getDb();
  return await d.getAllAsync("SELECT * FROM followups WHERE synced = 0");
}

export async function getUnsyncedVisitCount(): Promise<number> {
  const d = getDb();
  const row = await d.getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM visits WHERE synced = 0");
  return row?.c ?? 0;
}

export async function getUnsyncedFollowupCount(): Promise<number> {
  const d = getDb();
  const row = await d.getFirstAsync<{ c: number }>("SELECT COUNT(*) as c FROM followups WHERE synced = 0");
  return row?.c ?? 0;
}

export async function markVisitAsSynced(visitId: string): Promise<void> {
  const d = getDb();
  await d.runAsync("UPDATE visits SET synced = 1 WHERE id = ?", visitId);
}

export async function markFollowupAsSynced(followupId: string): Promise<void> {
  const d = getDb();
  await d.runAsync("UPDATE followups SET synced = 1 WHERE id = ?", followupId);
}

export async function updateChurchesFromSync(churches: any[]): Promise<void> {
  const d = getDb();
  // Clear existing churches and insert new ones
  await d.runAsync("DELETE FROM churches");
  for (const church of churches) {
    await d.runAsync(
      "INSERT INTO churches (id, name) VALUES (?, ?)",
      church.id,
      church.name
    );
  }
}

export async function updateMembersFromSync(members: any[], churchId: string): Promise<void> {
  const d = getDb();
  // Clear existing members for this church and insert new ones
  await d.runAsync("DELETE FROM members WHERE church_id = ?", churchId);
  for (const member of members) {
    await d.runAsync(
      "INSERT INTO members (id, first_name, last_name, church_id, affiliation, discipleship_status) VALUES (?, ?, ?, ?, ?, ?)",
      member.id,
      member.first_name,
      member.last_name,
      member.church_id,
      member.affiliation || 'member',
      member.discipleship_status || 'active'
    );
  }
}

export async function getUserChurches(): Promise<any[]> {
  const d = getDb();
  // For now, return all churches. In production, this would filter by user permissions
  return await d.getAllAsync("SELECT * FROM churches");
}

export async function updateLastSyncTimestamp(): Promise<void> {
  // For now, this is a placeholder. In production, store in a settings table or local storage
  console.log('Last sync updated:', new Date().toISOString());
}

export async function getLastSyncTimestamp(): Promise<Date | null> {
  // Placeholder - return a mock timestamp
  return new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
}

export async function getAllChurches(): Promise<any[]> {
  const d = getDb();
  return await d.getAllAsync("SELECT * FROM churches ORDER BY name");
}

export async function getMembersByChurch(churchId: string): Promise<any[]> {
  const d = getDb();
  return await d.getAllAsync("SELECT * FROM members WHERE church_id = ? ORDER BY last_name, first_name", churchId);
}

export async function searchMembers(query: string, churchId?: string): Promise<any[]> {
  const d = getDb();
  let sql = "SELECT * FROM members WHERE (first_name LIKE ? OR last_name LIKE ?)";
  const params: any[] = [`%${query}%`, `%${query}%`];
  
  if (churchId) {
    sql += " AND church_id = ?";
    params.push(churchId);
  }
  
  sql += " ORDER BY last_name, first_name LIMIT 20";
  return await d.getAllAsync(sql, ...params);
}
