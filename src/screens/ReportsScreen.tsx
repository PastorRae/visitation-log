import React from "react";
import { View, Text } from "react-native";

export default function ReportsScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Reports</Text>
      <Text>Reports are generated in PastoralCare Pro.</Text>
      <Text style={{ marginTop: 16 }}>
        This app is responsible for data collection. The collected data is synced to the PastoralCare Pro backend for reporting and analysis.
      </Text>
    </View>
  );
}
