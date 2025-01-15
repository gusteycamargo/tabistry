/* eslint-disable @typescript-eslint/no-explicit-any */
import { matchRoutes, useLocation, RouteMatch } from "react-router";
import { RouteDescriptor } from "../components/RecursiveRoute.js";
import { RouteTab } from "../models/RouteTab.js";
import { useMemo } from "react";

export type MatchedRoute<TTab extends RouteTab> =
  // @ts-expect-error: F*ck this
  RouteMatch<string, RouteDescriptor<TTab>>;

export const useMatchedRoutes = <TTab extends RouteTab>({
  routes,
}: {
  routes: RouteDescriptor<TTab>[];
}): MatchedRoute<TTab>[] => {
  const location = useLocation();

  return useMemo(() => {
    const matchedRoutes = matchRoutes(routes as any[], location.pathname);

    if (!matchedRoutes) return [];

    return matchedRoutes;
  }, [location, routes]) as MatchedRoute<TTab>[];
};
