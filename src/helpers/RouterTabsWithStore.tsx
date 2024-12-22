import { useCallback, useMemo, useState } from "react";
import { RouterTabState } from "../contexts/RouterTabContext.js";
import { RouterTab } from "../providers/RouterTabProvider.js";
import { findMatchingTab } from "../tools/findMatchingTab.js";
import { findRoute } from "../tools/findRoute.js";
import { WebLocationRouterTabsStore } from "../tools/WebLocationRouterTabsStore.js";
import { RouteDescriptor } from "../components/RecursiveRoute.js";
import { RouteTab } from "../models/RouteTab.js";

export interface RouterTabsWithStoreProps<TTab extends RouteTab> {
  storeKey: string;
  onAddTab?: (tab: TTab, state?: RouterTabState<TTab>) => void;
  onFocusTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  onRemoveTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  routes: RouteDescriptor<TTab>[];
  forceInitializeOfTabs?: string[];
}

export function RouterTabsWithStore<TTab extends RouteTab>({
  storeKey,
  onAddTab,
  onRemoveTab,
  onFocusTab,
  routes,
  ...props
}: RouterTabsWithStoreProps<TTab>) {
  const store = useMemo(
    () => new WebLocationRouterTabsStore<TTab>(storeKey),
    [storeKey]
  );

  const getTabsFromStorage = useCallback(() => {
    return store.get().map((tab) => {
      const route = findRoute({
        routes,
        attributeKey: "type",
        value: tab.type,
      });

      if (!route || !route.tab) throw new Error("Route with tab not found");

      const TabConstructor = route.tab;

      return new TabConstructor(tab.params, tab.query);
    });
  }, [store, routes]);

  const [tabs, setTabs] = useState(() => getTabsFromStorage());

  const set = useCallback((tabs: TTab[]) => store.set(tabs), [store]);

  const handleAddTab = useCallback(
    (tab: TTab, state?: RouterTabState<TTab>) => {
      setTabs((tabs) => {
        const _tab = findMatchingTab({ tabs, targetTab: tab });
        if (_tab) return tabs;

        const _tabs = tabs.concat(tab);

        set(_tabs);
        onAddTab?.(tab, state);
        return _tabs;
      });
    },
    [onAddTab, set]
  );

  const handleRemoveTab = useCallback(
    (tab: TTab, state: RouterTabState<TTab>) => {
      setTabs((tabs) => {
        const _tabs = tabs.toSpliced(tabs.indexOf(tab), 1);
        set(_tabs);
        onRemoveTab?.(tab, state);
        return _tabs;
      });
    },
    [onRemoveTab, set]
  );

  const handleFocusTab = useCallback(
    (tab: TTab, state: RouterTabState<TTab>) => {
      onFocusTab?.(tab, state);
      return store.setLastFocusTab(tab);
    },
    [store, onFocusTab]
  );

  return (
    <RouterTab
      tabs={tabs}
      onAddTab={handleAddTab}
      onFocusTab={handleFocusTab}
      onRemoveTab={handleRemoveTab}
      routes={routes}
      {...props}
    />
  );
}
