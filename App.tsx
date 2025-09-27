import React, { useEffect, useRef, useState } from "react";
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
  const lastOnline = useRef<boolean | null>(null);
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
  }, [biometricsEnabled, setOnline]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
  const state = await Network.getNetworkStateAsync();
  const online = !!state.isConnected && !!state.isInternetReachable;
  if (cancelled) return;
  const previous = lastOnline.current;
  lastOnline.current = online;
  setOnline(online);
  if (online && previous !== true) {
    runAutoSync().finally(() => setSynced(true));
  }
    };

    poll();
    const interval = setInterval(poll, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setOnline, setSynced]);

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
