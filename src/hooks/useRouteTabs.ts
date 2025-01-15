import { useContext, useMemo } from "react";
import {
  IRouterTabContext,
  RouterTabContext,
} from "../contexts/RouterTabContext.js";
import { RouteTab } from "../models/RouteTab.js";
import { useParams } from "react-router";
import { isContainedIn } from "../tools/isContainedIn.js";
import { useQuery } from "./useQuery.js";

interface RouteTabsProps {
  types?: string[];
  enableParamsFilter?: boolean;
}

export const useRouteTabs = <TRouteTab extends RouteTab>(
  props?: RouteTabsProps
) => {
  const { types, enableParamsFilter = false } = props ?? {};

  const params = useParams();
  const query = useQuery();

  const state = useContext(
    RouterTabContext
  ) as unknown as IRouterTabContext<TRouteTab> | null;

  if (!state)
    throw new Error("useRouteTabs must be used within a RouteTabsProvider");

  const tabs = useMemo(() => {
    if (!types) return state.tabs;

    return state.tabs.filter((tab) => {
      const matchTypes = types.includes(tab.type);
      if (!enableParamsFilter) return matchTypes;

      const matchParams = isContainedIn(tab.params, params);
      const matchQuery = isContainedIn(tab.query, query);

      return matchTypes && matchParams && matchQuery;
    });
  }, [state, types, enableParamsFilter, params, query]);

  return { ...state, tabs };
};
