import { useContext, useMemo } from "react";
import {
  IRouterTabContext,
  RouterTabContext,
} from "../contexts/RouterTabContext.js";
import { RouteTab } from "../models/RouteTab.js";

interface RouteTabsProps {
  types?: string[];
}

export const useRouteTabs = <TRouteTab extends RouteTab>(
  props?: RouteTabsProps
) => {
  const { types } = props ?? {};

  const state = useContext(
    RouterTabContext
  ) as unknown as IRouterTabContext<TRouteTab> | null;

  if (!state)
    throw new Error("useRouteTabs must be used within a RouteTabsProvider");

  const tabs = useMemo(() => {
    if (!types) return state.tabs;

    return state.tabs.filter((tab) => types.includes(tab.type));
  }, [state, types]);

  return { ...state, tabs };
};
