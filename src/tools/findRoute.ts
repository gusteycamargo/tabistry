import { RouteDescriptor } from "../components/RecursiveRoute.js";
import { RouteTab } from "../models/RouteTab.js";
import { Constructable } from "../types/constructable.js";

type FindFunction<TTab extends RouteTab> = (
  value: string | number | boolean | Constructable<TTab> | undefined
) => boolean;

interface FindProps<TTab extends RouteTab> {
  routes: RouteDescriptor<TTab>[];
  attributeKey: keyof RouteDescriptor<TTab>;
  value: string | number | boolean | Constructable<TTab> | FindFunction<TTab>;
  actualPath?: string;
}

export const findRoute = <TTab extends RouteTab>({
  routes,
  attributeKey,
  value,
  actualPath = "",
}: FindProps<TTab>): RouteDescriptor<TTab> | undefined => {
  const isValueFunction = typeof value === "function";

  for (const routeProp of routes) {
    const route = Object.assign({}, routeProp);

    if (actualPath) {
      if (!route.path) route.path = actualPath;
      else route.path = `${actualPath}/${route.path}`.replace(/\/+/g, "/");
    }

    if (route.children) {
      const result = findRoute({
        routes: route.children,
        attributeKey: attributeKey,
        value,
        actualPath: route.path,
      });

      if (result) return result;
    }

    const result = isValueFunction
      ? (value as FindFunction<TTab>)(route?.[attributeKey])
      : route?.[attributeKey] === value;

    if (result) return route;
  }

  return;
};
