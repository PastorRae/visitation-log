import React, { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { getRecentVisits } from "../db/db";
import { useAppStore, type AppState } from "../state/store";
import VisitCard from "../components/VisitCard";

export default function VisitsScreen() {
  const churchId = useAppStore((s: AppState) => s.churchId);
  const [q, setQ] = useState("");
  const [visits, setVisits] = useState<any[]>([]);

  const refresh = async () => {
    const v = await getRecentVisits(30, churchId);
    setVisits(v);
  };

  useEffect(() => {
    refresh();
  }, [churchId]);

  const filtered = visits.filter((v) => {
    const name = `${v.member_first ?? ""} ${v.member_last ?? ""}`.toLowerCase();
    return name.includes(q.toLowerCase());
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 12 }}>
        <TextInput
          placeholder="Search member (more filters Phase 2)"
          value={q}
          onChangeText={setQ}
          style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 }}
        />
      </View>
      <ScrollView style={{ paddingHorizontal: 12 }}>
        {filtered.map((v: any) => (
          <VisitCard key={v.id} v={v} />
        ))}
        {filtered.length === 0 && <Text style={{ padding: 12 }}>No visits found.</Text>}
      </ScrollView>
    </View>
  );
}
