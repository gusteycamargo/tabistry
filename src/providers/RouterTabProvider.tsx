/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  RouterTabContext,
  type RouterTabState,
} from "../contexts/RouterTabContext.js";
import {
  matchPath,
  PathMatch,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { generateRouteUrl } from "../tools/generateRouteUrl.js";
import { useQuery } from "../hooks/useQuery.js";
import {
  findIndexMatchingTab,
  findMatchingTab,
} from "../tools/findMatchingTab.js";
import { findRoute } from "../tools/findRoute.js";
import {
  recursiveRoute,
  RouteDescriptor,
} from "../components/RecursiveRoute.js";
import { RouteTab } from "../models/RouteTab.js";
import { isContainedIn } from "../tools/isContainedIn.js";
import {
  findRouteWithParents,
  RouteWithParent,
} from "../tools/findRouteWithParents.js";

export interface RouteTabProps<TTab extends RouteTab> {
  tabs: TTab[];
  onAddTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  onFocusTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  onBlurTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  onRemoveTab?: (tab: TTab, state: RouterTabState<TTab>) => void;
  routes: RouteDescriptor<TTab>[];
  forceInitializeOfTabs?: string[];
}

export interface RouteTabHandle<TTab extends RouteTab>
  extends RouterTabState<TTab> {}

function RouteTabProvider<TTab extends RouteTab>(
  {
    tabs,
    onAddTab,
    onFocusTab,
    onRemoveTab,
    routes,
    forceInitializeOfTabs,
  }: RouteTabProps<TTab>,
  ref: ForwardedRef<RouteTabHandle<TTab>>
) {
  const location = useLocation();
  const navigate = useNavigate();
  const query = useQuery();
  const stateRef = useRef<RouterTabState<TTab>>(null);
  const tabHierarchy = useMemo(() => new Map(), []);

  const setTabHierarchy = useCallback(
    (routeWithParents: RouteWithParent<TTab>, match: PathMatch<string>) => {
      if (!routeWithParents) return;

      if (routeWithParents.parent)
        setTabHierarchy(routeWithParents.parent, match);

      if (!routeWithParents.tab && !routeWithParents.element) return;

      const { tab: TabConstructor, element } = routeWithParents;

      tabHierarchy.set(
        routeWithParents.path,
        TabConstructor ? new TabConstructor(match.params, query) : element
      );
    },
    [tabHierarchy, query]
  );

  const handleTabAddition = useCallback(
    (tab: TTab, focus = true) => {
      const _tab = findMatchingTab({ tabs, targetTab: tab });
      if (!_tab) onAddTab?.(tab, stateRef.current!);

      if (!focus) return;

      onFocusTab?.(tab, stateRef.current!);
      setTab(tab);
    },
    [tabs, onAddTab, onFocusTab]
  );

  const initializeTabs = useCallback(
    (tabTypesToInitialize: string[], params = {}, queryParams = {}) => {
      if (!tabTypesToInitialize.length) return;

      tabTypesToInitialize.forEach((type) => {
        const route = findRoute({
          routes,
          attributeKey: "type",
          value: (_type) => _type === type,
        });
        if (!route || !route.tab) return;

        const TabConstructor = route.tab;

        handleTabAddition(new TabConstructor(params, queryParams), false);
      });
    },
    [routes, handleTabAddition]
  );

  const populateTabHierarchy = useCallback(
    (route: RouteDescriptor<TTab>, match: PathMatch<string>) => {
      const routeWithParents = findRouteWithParents({
        routes,
        path: route.path,
      });
      if (!routeWithParents) return;

      tabHierarchy.clear();
      setTabHierarchy(routeWithParents, match);
    },
    [routes, setTabHierarchy, tabHierarchy]
  );

  const getTabFromRoutes = useCallback(() => {
    const route = findRoute({
      routes,
      attributeKey: "path",
      value: (path) => !!matchPath(path as string, location.pathname),
    });
    if (!route) return;
    if (!route.tab && !route.element) return;

    const match = matchPath(route.path, location.pathname);
    if (!match) return;

    if (route.initializeTypesOnAdd)
      initializeTabs(route.initializeTypesOnAdd, match.params, query);

    populateTabHierarchy(route, match);

    if (!route.tab) return;

    const TabConstructor = route.tab;

    return new TabConstructor(match.params, query);
  }, [routes, location.pathname, query, initializeTabs, populateTabHierarchy]);

  const [tab, setTab] = useState<TTab | undefined>(() => getTabFromRoutes());

  const handleNavigateToTab = useCallback(
    (tab: TTab) => {
      const route = findRoute({
        routes,
        attributeKey: "tab",
        value: (routeTab) => tab.constructor === routeTab,
      });

      if (!route) return;

      const path = generateRouteUrl({
        pathname: route.path,
        params: tab.params,
        query: tab.query,
      });

      navigate(path, { replace: true });
    },
    [routes, navigate]
  );

  const handleRemove = useCallback(
    (tab: TTab) => {
      const _tab = findMatchingTab({
        tabs: stateRef.current?.tabs ?? [],
        targetTab: tab,
      });
      if (!_tab) return;

      if (_tab === stateRef.current?.tab) {
        const tabIndex = findIndexMatchingTab({
          tabs,
          targetTab: tab,
        });
        const tabChange = tabs[tabIndex + 1] || tabs[tabIndex - 1];
        tabChange ? handleNavigateToTab(tabChange) : setTab(undefined);
      }

      onRemoveTab?.(_tab, stateRef.current!);
    },
    [tabs, onRemoveTab, handleNavigateToTab]
  );

  const isTabActive = useCallback(
    (_tab: TTab) => {
      const isPrincipalTab = isContainedIn(_tab, tab!);
      if (isPrincipalTab) return true;

      for (const [, tab] of tabHierarchy) {
        if (!(tab instanceof RouteTab)) continue;

        if (isContainedIn(_tab, tab)) return true;
      }

      return false;
    },
    [tab, tabHierarchy]
  );

  const state: RouterTabState<TTab> = useMemo(
    () => ({
      tab,
      tabs,
      change: handleNavigateToTab,
      remove: handleRemove,
      isTabActive,
    }),
    [tab, tabs, handleNavigateToTab, handleRemove, isTabActive]
  );

  const synchronizeRouteTabState = useCallback(() => {
    const _tab = getTabFromRoutes();
    if (!_tab) return;

    handleTabAddition(_tab);
  }, [getTabFromRoutes, handleTabAddition]);

  useImperativeHandle(stateRef, () => state, [state]);
  useImperativeHandle(ref, () => state, [state]);

  useEffect(() => {
    synchronizeRouteTabState();
  }, [location, synchronizeRouteTabState]);

  useEffect(() => {
    if (!forceInitializeOfTabs) return;
    if (!forceInitializeOfTabs.length) return;

    initializeTabs(forceInitializeOfTabs);
  }, [initializeTabs, forceInitializeOfTabs]);

  return (
    // @ts-expect-error: TODO
    <RouterTabContext.Provider value={state}>
      <Routes>{recursiveRoute({ routes, tab, tabHierarchy })}</Routes>
    </RouterTabContext.Provider>
  );
}

export const RouterTab = forwardRef(RouteTabProvider) as <
  TTab extends RouteTab
>(
  props: RouteTabProps<TTab> & { ref?: ForwardedRef<RouteTabHandle<TTab>> }
) => ReturnType<typeof RouteTabProvider>;
