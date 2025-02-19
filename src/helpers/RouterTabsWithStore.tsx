import { useCallback, useMemo } from "react";
import { RouterTabState } from "../contexts/RouterTabContext.js";
import { RouterTab } from "../providers/RouterTabProvider.js";
import { findMatchingTab, isTabMatch } from "../tools/findMatchingTab.js";
import { findRoute } from "../tools/findRoute.js";
import { RouteDescriptor } from "../components/RecursiveRoute.js";
import { RouteTab } from "../models/RouteTab.js";
import { isContainedIn } from "../tools/isContainedIn.js";
import { useLocalStorage } from "../hooks/useLocalStorageSync.js";

export interface RouterTabsWithStoreProps<TTab extends RouteTab> {
  storeKey: string;
  fallbackPath: string;
  routes: RouteDescriptor<TTab>[];
}

export function RouterTabsWithStore<TTab extends RouteTab>({
  storeKey,
  fallbackPath,
  routes,
  ...props
}: RouterTabsWithStoreProps<TTab>) {
  const [tabs = [], setState] = useLocalStorage<TTab[]>(storeKey, []);

  const transformedTabs = useMemo(() => {
    return tabs
      .map((tab) => {
        const route = findRoute({
          routes,
          attributeKey: "type",
          value: tab.type,
        });

        if (route?.tab) return new route.tab(tab.params, tab.query);

        console.warn(`Route not found for tab: ${tab.type}`);
        return null;
      })
      .filter((tab) => tab) as unknown as TTab[];
  }, [tabs, routes]);

  const handleAddTab = useCallback(
    (tab: TTab, state?: RouterTabState<TTab>) => {
      setState((actualTabs) => {
        const _tab = findMatchingTab({ tabs: actualTabs, targetTab: tab });
        if (_tab) return actualTabs;

        return [...actualTabs, tab];
      });

      tab.onAdd?.();
      // @TODO - onBlur
    },
    [setState]
  );

  const handleRemoveTab = useCallback(
    (tab: TTab, state: RouterTabState<TTab>) => {
      const updatedTabs: TTab[] = [];

      setState((_tabs) => {
        const tabs = _tabs.filter((_tab) => {
          const isActualTab = isTabMatch(_tab, tab);
          const isRelatedTab =
            isContainedIn(tab.params, _tab.params) &&
            isContainedIn(tab.query, _tab.query);

          return !isActualTab && !isRelatedTab;
        });

        updatedTabs.push(...tabs);

        return tabs;
      });

      tab.onRemove?.();

      return updatedTabs;
    },
    [setState]
  );

  const handleFocusTab = useCallback(
    (tab: TTab, state: RouterTabState<TTab>) => {
      tab.onFocus?.();
      // @TODO - onBlur
    },
    []
  );

  return (
    <RouterTab
      tabs={transformedTabs}
      onAddTab={handleAddTab}
      onFocusTab={handleFocusTab}
      onRemoveTab={handleRemoveTab}
      fallbackPath={fallbackPath}
      routes={routes}
      {...props}
    />
  );
}
