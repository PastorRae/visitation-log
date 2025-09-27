import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Network from "expo-network";
import * as LocalAuthentication from "expo-local-authentication";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { initDb } from "./src/db/db";
import { RootTabs } from "./src/navigation";
import { useAppStore, type AppState } from "./src/state/store";
import { runAutoSync } from "./src/services/sync";

export default function App() {
  const [ready, setReady] = useState(false);
  const biometricsEnabled = useAppStore((s: AppState) => s.biometricsEnabled);
  const setOnline = useAppStore((s: AppState) => s.setOnline);
  const setSynced = useAppStore((s: AppState) => s.setSynced);

  useEffect(() => {
    (async () => {
      await initDb();
      if (biometricsEnabled) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (hasHardware) {
          await LocalAuthentication.authenticateAsync({
            promptMessage: "Unlock Visitation Dashboard"
          });
        }
      }
      const net = await Network.getNetworkStateAsync();
      setOnline(!!net.isConnected && !!net.isInternetReachable);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    const sub = Network.addNetworkStateListener((s: Network.NetworkState) => {
      const online = !!s.isConnected && !!s.isInternetReachable;
      setOnline(online);
      if (online) {
        runAutoSync().finally(() => setSynced(true));
      }
    });
    return () => sub && (sub as any).remove && (sub as any).remove();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer theme={DefaultTheme}>
      <RootTabs />
    </NavigationContainer>
  );
}
