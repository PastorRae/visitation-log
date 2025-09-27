import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AppState {
  churchId?: string;
  online: boolean;
  syncing: boolean;
  synced: boolean;
  biometricsEnabled: boolean;
  setChurch(id?: string): void;
  setOnline(v: boolean): void;
  setSyncing(v: boolean): void;
  setSynced(v: boolean): void;
  setBiometrics(v: boolean): void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set: any) => ({
      churchId: "slc-bb-main",
      online: false,
      syncing: false,
      synced: true,
      biometricsEnabled: false,
      setChurch: (churchId?: string) => set({ churchId }),
      setOnline: (online: boolean) => set({ online }),
      setSyncing: (syncing: boolean) => set({ syncing }),
      setSynced: (synced: boolean) => set({ synced }),
      setBiometrics: (biometricsEnabled: boolean) => set({ biometricsEnabled })
    }),
    { name: "app-state", storage: createJSONStorage(() => AsyncStorage) }
  )
);
