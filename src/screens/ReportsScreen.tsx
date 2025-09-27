import React from "react";
import { View, Text } from "react-native";

export default function ReportsScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Personal Dashboard</Text>
      <Text>- Visits completed this month: coming soon</Text>
      <Text>- Average visits per week: coming soon</Text>
      <Text>- Follow-up completion rate: coming soon</Text>
      <Text>- Category distribution: coming soon</Text>
      <Text style={{ marginTop: 16 }}>Conference reports and visualizations land in Phase 3.</Text>
    </View>
  );
}
