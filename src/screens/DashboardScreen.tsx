import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { countOverdueFollowups, getRecentVisits, getTodayVisits } from "../db/db";
import { useAppStore, type AppState } from "../state/store";
import VisitCard from "../components/VisitCard";

export default function DashboardScreen() {
  const nav = useNavigation<any>();
  const churchId = useAppStore((s: AppState) => s.churchId);
  const online = useAppStore((s: AppState) => s.online);
  const syncing = useAppStore((s: AppState) => s.syncing);
  const [today, setToday] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [overdue, setOverdue] = useState(0);

  const refresh = async () => {
    setToday(await getTodayVisits(churchId));
    setRecent(await getRecentVisits(7, churchId));
    setOverdue(await countOverdueFollowups(Date.now(), churchId));
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
        {today.length === 0 ? <Text>No visits scheduled today.</Text> : today.map((v: any) => <VisitCard key={v.id} v={v} />)}
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          Follow-ups Due <Text style={{ color: overdue > 0 ? "red" : "gray" }}>({overdue})</Text>
        </Text>
        <Text style={{ color: "#666" }}>Swipe actions and follow-up completion coming in Phase 2.</Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Recent Visits (7 days)</Text>
        {recent.length === 0 ? <Text>No recent visits.</Text> : recent.map((v: any) => <VisitCard key={v.id} v={v} />)}
      </View>

      <View>
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Quick Stats</Text>
        <Text>- Placeholder: visits this month, follow-up rate, trends charts (Phase 3)</Text>
      </View>

      <View style={{ height: 24 }} />
      <Button title="Switch Church" onPress={() => useAppStore.getState().setChurch(churchId === "slc-bb-main" ? "slc-bb-alt" : "slc-bb-main")} />
    </ScrollView>
  );
}
