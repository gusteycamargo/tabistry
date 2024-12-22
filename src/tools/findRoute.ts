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
}: FindProps<TTab>): RouteDescriptor<TTab> | undefined => {
  const isValueFunction = typeof value === "function";

  for (const route of routes) {
    const result = isValueFunction
      ? (value as FindFunction<TTab>)(route[attributeKey])
      : route[attributeKey] === value;

    if (result) return route;

    if (route.childrens) {
      const result = findRoute({
        routes: route.childrens,
        attributeKey: attributeKey,
        value,
        actualPath: route.path,
      });

      if (result) return result;
    }
  }

  return;
};
