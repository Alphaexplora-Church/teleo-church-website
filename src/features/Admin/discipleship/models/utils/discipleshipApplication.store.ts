import { useSyncExternalStore } from "react";
import type { DiscipleshipApplicant } from "../types/discipleshipApplication.types";

let currentApplicants: DiscipleshipApplicant[] = [];
const listeners = new Set<() => void>();

export const discipleshipApplicationsStore = {
  getApplicants(): DiscipleshipApplicant[] {
    return currentApplicants;
  },

  setApplicants(
    updater:
      | DiscipleshipApplicant[]
      | ((prev: DiscipleshipApplicant[]) => DiscipleshipApplicant[]),
  ): void {
    currentApplicants =
      typeof updater === "function" ? updater(currentApplicants) : updater;
    listeners.forEach((listener) => listener());
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getPendingCount(): number {
    return currentApplicants.filter((a) => a.status === "PENDING").length;
  },
};

/**
 * Hook to dynamically subscribe to the pending applications count.
 * Enables navigation / sidebar components to display real-time notification pills.
 */
export function usePendingApplicationsCount(): number {
  return useSyncExternalStore(
    discipleshipApplicationsStore.subscribe,
    discipleshipApplicationsStore.getPendingCount,
  );
}
