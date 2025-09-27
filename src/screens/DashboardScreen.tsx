import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { countOverdueFollowups, getRecentVisits, getTodayVisits, getDb } from "../db/db";
import { useAppStore, type AppState } from "../state/store";
import VisitCard from "../components/VisitCard";
import type { VisitRecord, KpiDashboard } from "../types";

export default function DashboardScreen() {
  const nav = useNavigation<any>();
  const churchId = useAppStore((s: AppState) => s.churchId);
  const online = useAppStore((s: AppState) => s.online);
  const syncing = useAppStore((s: AppState) => s.syncing);
  const [today, setToday] = useState<VisitRecord[]>([]);
  const [recent, setRecent] = useState<VisitRecord[]>([]);
  const [overdue, setOverdue] = useState(0);
  const [kpiDashboard, setKpiDashboard] = useState<KpiDashboard | null>(null);

  const refresh = async () => {
    const db = getDb();
    setToday(await getTodayVisits(churchId));
    setRecent(await getRecentVisits(7, churchId));
    setOverdue(await countOverdueFollowups(Date.now(), churchId));
    const kpi = await db.getFirstAsync<KpiDashboard>(
      "SELECT * FROM kpi_dashboards WHERE church_id = ?",
      churchId
    );
    setKpiDashboard(kpi);
  };

  useEffect(() => {
    refresh();
  }, [churchId]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ marginBottom: 12, flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Church: {churchId}</Text>
        <Text style={{ color: online ? "green" : "gray" }}>{online ? "Online" : "Offline"} {syncing ? "• Syncing" : ""}</Text>
      </View>

      <TouchableOpacity
        onPress={() => nav.navigate("LogVisit")}
        style={{ backgroundColor: "#1976D2", padding: 16, borderRadius: 10, marginBottom: 16 }}
        accessibilityRole="button"
        accessibilityLabel="Log new visit"
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16, fontWeight: "700" }}>Log New Visit</Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          Today's Schedule
        </Text>
        {today.length === 0
          ? <Text>No visits scheduled today.</Text>
          : today.map((visit: VisitRecord) => <VisitCard key={visit.id} visit={visit} />)}
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          Follow-ups Due <Text style={{ color: overdue > 0 ? "red" : "gray" }}>({overdue})</Text>
        </Text>
        <Text style={{ color: "#666" }}>Swipe actions and follow-up completion coming in Phase 2.</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Recent Visits (7 days)</Text>
        {recent.length === 0
          ? <Text>No recent visits.</Text>
          : recent.map((visit: VisitRecord) => <VisitCard key={visit.id} visit={visit} />)}
      </View>

      <View>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>KPI Dashboard</Text>
        {kpiDashboard ? (
          <>
            <Text>Community Service Hours: {kpiDashboard.community_service_hours}</Text>
            <Text>Small Groups Per Church: {kpiDashboard.small_groups_per_church}</Text>
            <Text>Digital Evangelism Reach: {kpiDashboard.digital_evangelism_reach}</Text>
          </>
        ) : (
          <Text>No KPI data available.</Text>
        )}
      </View>

      <View style={{ height: 24 }} />
      <Button title="Switch Church" onPress={() => useAppStore.getState().setChurch(churchId === "slc-bb-main" ? "slc-bb-alt" : "slc-bb-main")} />
    </ScrollView>
  );
}
