import AsyncStorage from "@react-native-async-storage/async-storage";
import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CHURCH_IDS, type ChurchId } from "../types";

export interface AppState {
  churchId: ChurchId;
  online: boolean;
  syncing: boolean;
  synced: boolean;
  biometricsEnabled: boolean;
  setChurch(id: ChurchId): void;
  setOnline(v: boolean): void;
  setSyncing(v: boolean): void;
  setSynced(v: boolean): void;
  setBiometrics(v: boolean): void;
}

type AppStateCreator = StateCreator<AppState>;

const appStateCreator: AppStateCreator = (set) => ({
  churchId: CHURCH_IDS.MAIN,
  online: false,
  syncing: false,
  synced: true,
  biometricsEnabled: false,
  setChurch: (churchId: ChurchId) => set({ churchId }),
  setOnline: (online: boolean) => set({ online }),
  setSyncing: (syncing: boolean) => set({ syncing }),
  setSynced: (synced: boolean) => set({ synced }),
  setBiometrics: (biometricsEnabled: boolean) => set({ biometricsEnabled })
});

export const useAppStore = create<AppState>()(
  persist<AppState>(appStateCreator, {
    name: "app-state",
    storage: createJSONStorage<AppState>(() => AsyncStorage)
  })
);
