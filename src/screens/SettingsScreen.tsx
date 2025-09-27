import React from "react";
import { View, Text, Switch, Button, Linking } from "react-native";
import { useAppStore, type AppState } from "../state/store";
import { runManualSync } from "../services/sync";

export default function SettingsScreen() {
  const churchId = useAppStore((s: AppState) => s.churchId);
  const setChurch = useAppStore((s: AppState) => s.setChurch);
  const biometricsEnabled = useAppStore((s: AppState) => s.biometricsEnabled);
  const setBiometrics = useAppStore((s: AppState) => s.setBiometrics);
  const syncing = useAppStore((s: AppState) => s.syncing);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Settings</Text>

      <Text style={{ marginBottom: 6 }}>Church</Text>
      <Button title={`Current: ${churchId} (tap to switch)`} onPress={() => setChurch(churchId === "slc-bb-main" ? "slc-bb-alt" : "slc-bb-main")} />

      <View style={{ height: 16 }} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text>Biometric unlock</Text>
        <Switch value={biometricsEnabled} onValueChange={setBiometrics} />
      </View>

      <View style={{ height: 16 }} />
      <Button title={syncing ? "Syncing..." : "Manual Sync"} disabled={syncing} onPress={() => runManualSync()} />

      <View style={{ height: 16 }} />
      <Text style={{ fontWeight: "700", marginBottom: 8 }}>Integrations</Text>
      <Button title="Open WhatsApp" onPress={() => Linking.openURL("whatsapp://send?text=Hello")} />
      <View style={{ height: 8 }} />
      <Button title="Open Maps" onPress={() => Linking.openURL("https://maps.google.com/?q=Barbados")} />

      <View style={{ height: 24 }} />
      <Text style={{ color: "#666" }}>
        Voice messages, Google Calendar, and admin reports will be added in subsequent phases.
      </Text>
    </View>
  );
}
