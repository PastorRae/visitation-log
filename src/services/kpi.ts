import { getDb } from "../db/db";
import { VisitLog, KpiDashboard } from "../types";

// Generate a simple UUID for React Native environment
function generateUUID(): string {
  if (typeof globalThis !== "undefined" && 
      typeof globalThis.crypto === "object" && 
      typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  // Fallback UUID generation
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function calculateKpis(visitLog: VisitLog): Promise<KpiDashboard> {
  const db = getDb();

  // For now, we'll use simplified KPI calculation since church profiles might not exist
  let communityServiceHours = 0;
  if (visitLog.metrics.patients_screened) {
    communityServiceHours = visitLog.metrics.patients_screened;
  }

  let smallGroupsPerChurch = 0;
  if (visitLog.metrics.small_groups_identified) {
    smallGroupsPerChurch = visitLog.metrics.small_groups_identified;
  }

  const kpiDashboard = await db.getFirstAsync<KpiDashboard>(
    "SELECT * FROM kpi_dashboards WHERE church_id = ?",
    visitLog.activity_metadata.church_id
  );

  if (kpiDashboard) {
    const updatedKpi = {
      ...kpiDashboard,
      community_service_hours: kpiDashboard.community_service_hours + communityServiceHours,
      small_groups_per_church: kpiDashboard.small_groups_per_church + smallGroupsPerChurch,
      updated_at: Date.now(),
    };
    await db.runAsync(
      "UPDATE kpi_dashboards SET community_service_hours = ?, small_groups_per_church = ?, updated_at = ? WHERE id = ?",
      updatedKpi.community_service_hours,
      updatedKpi.small_groups_per_church,
      updatedKpi.updated_at,
      updatedKpi.id
    );
    return updatedKpi;
  } else {
    const newKpi = {
      id: generateUUID(),
      church_id: visitLog.activity_metadata.church_id,
      community_service_hours: communityServiceHours,
      small_groups_per_church: smallGroupsPerChurch,
      digital_evangelism_reach: 0, // This will be updated from another module
      updated_at: Date.now(),
    };
    await db.runAsync(
      "INSERT INTO kpi_dashboards (id, church_id, community_service_hours, small_groups_per_church, digital_evangelism_reach, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      newKpi.id,
      newKpi.church_id,
      newKpi.community_service_hours,
      newKpi.small_groups_per_church,
      newKpi.digital_evangelism_reach,
      newKpi.updated_at
    );
    return newKpi;
  }
}

export async function checkKpiAlerts(kpiDashboard: KpiDashboard) {
  // Simplified alert system for now - just log to console
  // In a full implementation, this would check against church profile targets
  // and send actual alerts via email/SMS
  
  console.log("KPI Alert Check:", {
    church_id: kpiDashboard.church_id,
    community_service_hours: kpiDashboard.community_service_hours,
    small_groups_per_church: kpiDashboard.small_groups_per_church,
    digital_evangelism_reach: kpiDashboard.digital_evangelism_reach
  });
  
  // Placeholder alert thresholds
  if (kpiDashboard.community_service_hours < 10) {
    console.log("ALERT: Community service hours KPI is below minimum threshold");
  }

  if (kpiDashboard.small_groups_per_church < 1) {
    console.log("ALERT: Small groups per church KPI is below minimum threshold");
  }
}
