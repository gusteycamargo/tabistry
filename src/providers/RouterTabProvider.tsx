/* eslint-disable @typescript-eslint/no-empty-object-type */

import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  RouterTabContext,
  type RouterTabState,
} from "../contexts/RouterTabContext.js";
import { useNavigate } from "react-router";
import { generateRouteUrl } from "../tools/generateRouteUrl.js";
import { useQuery } from "../hooks/useQuery.js";
import { findMatchingTab } from "../tools/findMatchingTab.js";
import { findRoute } from "../tools/findRoute.js";
import {
  RecursiveRoute,
  RouteDescriptor,
} from "../components/RecursiveRoute.js";
import { RouteTab } from "../models/RouteTab.js";
import { isContainedIn } from "../tools/isContainedIn.js";
import { MatchedRoute, useMatchedRoutes } from "../hooks/useMatchedRoutes.js";

export interface RouteTabProps<TTab extends RouteTab> {
  tabs: TTab[];
  onAddTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  onFocusTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  onBlurTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  onRemoveTab?: (tab: TTab, state: RouterTabState<TTab>) => TTab[];
  routes: RouteDescriptor<TTab>[];
  fallbackPath?: string;
}

export interface RouteTabHandle<TTab extends RouteTab>
  extends RouterTabState<TTab> {}

function RouteTabProvider<TTab extends RouteTab>(
  {
    tabs,
    onAddTab,
    onFocusTab,
    fallbackPath,
    onRemoveTab,
    routes,
  }: RouteTabProps<TTab>,
  ref: ForwardedRef<RouteTabHandle<TTab>>
) {
  const navigate = useNavigate();
  const query = useQuery();
  const stateRef = useRef<RouterTabState<TTab>>(null);
  const activeRoutes = useMatchedRoutes({ routes });

  const lastActiveRoutesRef = useRef<MatchedRoute<TTab>[]>([]);

  const isRoutesEqual = useCallback(
    (prevRoutes: MatchedRoute<TTab>[], nextRoutes: MatchedRoute<TTab>[]) => {
      if (prevRoutes.length !== nextRoutes.length) return false;

      return prevRoutes.every((prevRoute, index) => {
        const nextRoute = nextRoutes[index];
        return (
          prevRoute.route.type === nextRoute.route.type &&
          JSON.stringify(prevRoute.params) === JSON.stringify(nextRoute.params)
        );
      });
    },
    []
  );

  const handleTabAddition = useCallback(
    (_route: MatchedRoute<TTab>, focus = true) => {
      const { route, params } = _route;

      if (!route.tab) return;
      const tab = new route.tab(params, query);

      const tabAlreadyExists = findMatchingTab({ tabs, targetTab: tab });
      if (tabAlreadyExists) return;

      onAddTab?.(tab, stateRef.current!);

      if (!focus) return;

      onFocusTab?.(tab, stateRef.current!);
    },
    [tabs, onAddTab, query, onFocusTab]
  );

  const handleInitializeTabs = useCallback(
    ({ matchedRoutes }: { matchedRoutes: MatchedRoute<TTab>[] }) => {
      for (const matchedRoute of matchedRoutes) {
        const children = matchedRoute.route.children ?? [];

        if (children.length) {
          const toInitialize = children
            .filter((route) => route.forceInitialization && route.tab)
            .map((_route) => ({ route: _route, params: matchedRoute.params }));

          if (toInitialize.length) {
            handleInitializeTabs({
              matchedRoutes: toInitialize as MatchedRoute<TTab>[],
            });
          }
        }

        handleTabAddition(matchedRoute);
      }
    },
    [handleTabAddition]
  );

  const handleNavigateToTab = useCallback(
    (tab: TTab) => {
      const route = findRoute({
        routes,
        attributeKey: "type",
        value: (type) => tab.type === type,
      });

      if (!route || !route.path) return;

      const path = generateRouteUrl({
        pathname: route.path,
        params: tab.params,
        query: tab.query,
      });

      onFocusTab?.(tab, stateRef.current!);

      navigate(path);
    },
    [routes, navigate, onFocusTab]
  );

  const handleRemove = useCallback(
    (tab: TTab) => {
      const _tab = findMatchingTab({
        tabs: stateRef.current?.tabs ?? [],
        targetTab: tab,
      });
      if (!_tab) return;

      const actualRoute = activeRoutes.at(-1);
      if (!actualRoute) return;

      const isActualTab =
        isContainedIn(_tab.params, actualRoute.params) &&
        isContainedIn(_tab.query, query);

      const remainingTabs = onRemoveTab?.(_tab, stateRef.current!);
      if (!remainingTabs) return;
      if (!isActualTab) return;

      const nextTabWithSameType = remainingTabs.find(
        (tab) => tab.type === _tab.type
      );

      if (nextTabWithSameType) return handleNavigateToTab(nextTabWithSameType);
      if (fallbackPath) return navigate(fallbackPath);

      throw new Error("Cannot redirect to a tab that is being removed");
    },
    [
      onRemoveTab,
      handleNavigateToTab,
      activeRoutes,
      query,
      navigate,
      fallbackPath,
    ]
  );

  const isTabActive = useCallback(
    (_tab: TTab) => {
      for (const { route, params } of activeRoutes) {
        if (!route.tab) continue;
        if (route.type !== _tab.type) continue;
        if (!isContainedIn(_tab.params, params)) continue;
        if (!isContainedIn(_tab.query, query)) continue;

        return true;
      }

      return false;
    },
    [query, activeRoutes]
  );

  const state: RouterTabState<TTab> = useMemo(
    () => ({
      tabs,
      change: handleNavigateToTab,
      remove: handleRemove,
      isTabActive,
    }),
    [tabs, handleNavigateToTab, handleRemove, isTabActive]
  );

  const synchronizeRouteTabState = useCallback(() => {
    handleInitializeTabs({ matchedRoutes: activeRoutes });

    lastActiveRoutesRef.current = activeRoutes;
  }, [activeRoutes, handleInitializeTabs]);

  useImperativeHandle(stateRef, () => state, [state]);
  useImperativeHandle(ref, () => state, [state]);

  useEffect(() => {
    if (!lastActiveRoutesRef.current.length) return synchronizeRouteTabState();
    if (isRoutesEqual(lastActiveRoutesRef.current, activeRoutes)) return;

    synchronizeRouteTabState();
  }, [synchronizeRouteTabState, activeRoutes, isRoutesEqual]);

  return (
    <RouterTabContext.Provider
      value={state as unknown as RouterTabState<RouteTab>}
    >
      <RecursiveRoute routes={routes} />
    </RouterTabContext.Provider>
  );
}

export const RouterTab = forwardRef(RouteTabProvider) as <
  TTab extends RouteTab
>(
  props: RouteTabProps<TTab> & { ref?: ForwardedRef<RouteTabHandle<TTab>> }
) => ReturnType<typeof RouteTabProvider>;
