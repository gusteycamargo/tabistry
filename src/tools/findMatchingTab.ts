import { RouteTab } from "../models/RouteTab.js";
import { deepEqual } from "./deepEqual.js";

interface Props<TRouteTab extends RouteTab> {
  tabs: TRouteTab[];
  targetTab: TRouteTab;
}

const isTabMatch = <TRouteTab extends RouteTab>(
  tab: TRouteTab,
  targetTab: TRouteTab
) => {
  const allParamsMatch = deepEqual(tab.params, targetTab.params);
  const allQueryParamsMatch = deepEqual(tab.query, targetTab.query);
  const isSameType = tab.type === targetTab.type;

  return allParamsMatch && allQueryParamsMatch && isSameType;
};

export const findMatchingTab = <TRouteTab extends RouteTab>({
  tabs,
  targetTab,
}: Props<TRouteTab>) => tabs.find((tab) => isTabMatch(tab, targetTab));

export const findIndexMatchingTab = <TRouteTab extends RouteTab>({
  tabs,
  targetTab,
}: Props<TRouteTab>) => tabs.findIndex((tab) => isTabMatch(tab, targetTab));
