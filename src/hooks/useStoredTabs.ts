import { useCallback } from "react";
import { RouteTab } from "../models/RouteTab.js";
import { useLocalStorage } from "./useLocalStorageSync.js";
import { findMatchingTab } from "../tools/findMatchingTab.js";

interface StoredTabsProps {
  storeKey: string;
}

type StoredRouteTab = Pick<RouteTab, "type" | "query" | "params">;

export const useStoredTabs = <TTab extends RouteTab>({
  storeKey,
}: StoredTabsProps) => {
  const [tabs = [], setState] = useLocalStorage<StoredRouteTab[]>(storeKey, []);

  const handleAddTab = useCallback(
    (tab: StoredRouteTab) => {
      setState((actualTabs) => {
        const _tab = findMatchingTab({
          tabs: actualTabs as unknown as RouteTab[],
          targetTab: tab as unknown as RouteTab,
        });
        if (_tab) return actualTabs;

        return [...actualTabs, tab];
      });
    },
    [setState]
  );

  return { tabs: tabs as TTab[], addTab: handleAddTab };
};
