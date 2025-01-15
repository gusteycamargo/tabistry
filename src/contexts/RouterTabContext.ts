/* eslint-disable @typescript-eslint/no-empty-object-type */

import { createContext } from "react";
import { RouteTab } from "../models/RouteTab.js";

export interface RouterTabState<TTab extends RouteTab> {
  tabs: TTab[];
  change: (tab: TTab) => void;
  remove: (tab: TTab) => void;
  isTabActive: (tab: TTab) => boolean;
}
export interface IRouterTabContext<TTab extends RouteTab>
  extends RouterTabState<TTab> {}

export const RouterTabContext = createContext<IRouterTabContext<RouteTab>>(
  null as unknown as IRouterTabContext<RouteTab>
);
