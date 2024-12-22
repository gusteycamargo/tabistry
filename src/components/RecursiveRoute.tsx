import { PathRouteProps, Route } from "react-router";
import { RouteTab } from "../models/RouteTab.js";
import { Constructable } from "../types/constructable.js";

export interface RouteDescriptor<TTab extends RouteTab>
  extends Omit<PathRouteProps, "index"> {
  path: string;
  tab?: Constructable<TTab>;
  type?: string;
  childrens?: RouteDescriptor<TTab>[];
  index?: boolean;
  initializeTypesOnAdd?: string[];
}

interface RecursiveRouteProps<TTab extends RouteTab> {
  routes: RouteDescriptor<TTab>[];
  tab?: TTab;
  tabHierarchy: Map<string, TTab>;
}

export const recursiveRoute = <TTab extends RouteTab>({
  routes,
  tab,
  tabHierarchy,
}: RecursiveRouteProps<TTab>) => {
  return routes.map(({ path, childrens, element, ...props }) => {
    const hasTabInHierarchy = tabHierarchy.get(path);
    const _tab = hasTabInHierarchy ?? tab;
    const elementToRender = element ?? _tab?.renderScreen();

    if (childrens) {
      return (
        // @ts-expect-error: TODO
        <Route key={path} path={path} element={elementToRender} {...props}>
          {recursiveRoute({
            routes: childrens,
            tab,
            tabHierarchy: tabHierarchy,
          })}
        </Route>
      );
    }

    return (
      // @ts-expect-error: TODO
      <Route key={path} path={path} element={elementToRender} {...props} />
    );
  });
};
