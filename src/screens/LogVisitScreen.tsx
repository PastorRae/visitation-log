import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import * as Location from "expo-location";
import { insertVisit } from "../db/db";
import { VisitCategory, VisitType } from "../types";
import { useAppStore, type AppState } from "../state/store";

function ChoiceRow<T extends string>({
  value,
  onChange,
  options
}: {
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          onPress={() => onChange(o.value)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: value === o.value ? "#1976D2" : "#eee",
            marginRight: 8,
            marginBottom: 8
          }}
          accessibilityRole="button"
          accessibilityLabel={o.label}
        >
          <Text style={{ color: value === o.value ? "#fff" : "#000" }}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function genId() {
  // Prefer secure UUID if available
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto === "object" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  // Fallback: Generate UUID v4 manually
  // Explanation:
  // - 16: Number of possible hex digits (0-15)
  // - 0x3: Mask for bits 12-15 (used for 'y' placeholder)
  // - 0x8: Sets the variant bits as per RFC4122
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    // For 'x', use random hex digit; for 'y', set variant bits
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function LogVisitScreen() {
  const churchId = useAppStore((s: AppState) => s.churchId);
  const [member, setMember] = useState("");
  const [visitType, setVisitType] = useState<VisitType>("in_person");
  const [category, setCategory] = useState<VisitCategory>("pastoral");
  const [comments, setComments] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
      const now = Date.now();
      const [first, ...rest] = member.trim().split(" ");
      const last = rest.join(" ");
      const v = {
        id: genId(),
        visit_date: now,
        pastor_email: "pastor@example.org",
        pastor_name: "Pastor John Doe",
        member_first: first || undefined,
        member_last: last || undefined,
        church_id: churchId,
        visit_type: visitType,
        category,
        comments: comments || undefined,
        lat,
        lng,
        synced: 0 as 0,
        updated_at: now
      };
      await insertVisit(v);
      Alert.alert("Saved", "Visit saved locally. Will sync when online.");
      setMember("");
      setComments("");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save visit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Member Name</Text>
      <TextInput
        placeholder="Type name (autocomplete in Phase 2)"
        value={member}
        onChangeText={setMember}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}
        accessibilityLabel="Member name"
      />

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Visit Type</Text>
      <ChoiceRow
        value={visitType}
        onChange={setVisitType}
        options={[
          { label: "In Person", value: "in_person" },
          { label: "Phone", value: "phone" },
          { label: "Video", value: "video" },
          { label: "Emergency", value: "emergency" },
          { label: "Hospital", value: "hospital" },
          { label: "Home", value: "home" },
          { label: "Office", value: "office" }
        ]}
      />

      <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 8 }}>Category</Text>
      <ChoiceRow
        value={category}
        onChange={setCategory}
        options={[
          { label: "Pastoral", value: "pastoral" },
          { label: "Crisis", value: "crisis" },
          { label: "Discipleship", value: "discipleship" },
          { label: "Administrative", value: "administrative" },
          { label: "Evangelism", value: "evangelism" },
          { label: "Conflict", value: "conflict" },
          { label: "Celebration", value: "celebration" },
          { label: "Bereavement", value: "bereavement" }
        ]}
      />

      <Text style={{ fontSize: 16, fontWeight: "600", marginTop: 12, marginBottom: 8 }}>Comments</Text>
      <TextInput
        placeholder="Notes (voice-to-text in Phase 2)"
        value={comments}
        onChangeText={setComments}
        multiline
        numberOfLines={4}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, minHeight: 100 }}
        accessibilityLabel="Comments"
      />

      <TouchableOpacity
        onPress={save}
        disabled={saving}
        style={{
          backgroundColor: saving ? "#90CAF9" : "#1976D2",
          padding: 16,
          borderRadius: 10,
          marginTop: 16
        }}
        accessibilityRole="button"
        accessibilityLabel="Quick Save"
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16, fontWeight: "700" }}>
          {saving ? "Saving..." : "Quick Save"}
        </Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 16, color: "#666" }}>
        Detailed mode (duration, scripture, prayer, resources, follow-up, scheduling) coming in Phase 2.
      </Text>
    </ScrollView>
  );
}
