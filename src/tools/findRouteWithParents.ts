import { RouteDescriptor } from "../components/RecursiveRoute.js";
import { RouteTab } from "../models/RouteTab.js";

export interface RouteWithParent<TTab extends RouteTab>
  extends RouteDescriptor<TTab> {
  parent?: RouteWithParent<TTab>;
}

export function findRouteWithParents<TTab extends RouteTab>({
  routes,
  path,
  parent,
}: {
  routes: RouteDescriptor<TTab>[];
  path: string;
  parent?: RouteWithParent<TTab>;
}): RouteWithParent<TTab> | undefined {
  for (const route of routes) {
    if (route.path === path) return { ...route, parent };

    if (route.childrens) {
      const result = findRouteWithParents({
        routes: route.childrens,
        path,
        parent: { ...route, parent },
      });

      if (result) return result;
    }
  }

  return;
}
