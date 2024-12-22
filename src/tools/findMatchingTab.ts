import { RouteTab } from "../models/RouteTab.js";
import { isContainedIn } from "./isContainedIn.js";

interface Props<TRouteTab extends RouteTab> {
  tabs: TRouteTab[];
  targetTab: TRouteTab;
}

const isTabMatch = <TRouteTab extends RouteTab>(
  tab: TRouteTab,
  targetTab: TRouteTab
) => {
  const allParamsMatch = isContainedIn(tab.params, targetTab.params);
  const allQueryParamsMatch = isContainedIn(tab.query, targetTab.query);
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
