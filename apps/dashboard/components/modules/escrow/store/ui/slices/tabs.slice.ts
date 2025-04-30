import type { StateCreator } from "zustand";
import type { TabsEscrowStore } from "../@types/tabs.entity";
import type { RolesInEscrow } from "~/@types/escrow.entity";

export const useEscrowTabSlice: StateCreator<
  TabsEscrowStore,
  [["zustand/devtools", never]],
  [],
  TabsEscrowStore
> = (set) => {
  return {
    // Stores
    activeTab: "issuer",

    // Modifiers
    setActiveTab: (value: RolesInEscrow) => set({ activeTab: value }),
  };
};
