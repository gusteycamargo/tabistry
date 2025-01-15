/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  matchRoutes,
  PathRouteProps,
  Route,
  Routes,
  useLocation,
} from "react-router";
import { RouteTab } from "../models/RouteTab.js";
import { Constructable } from "../types/constructable.js";
import { useQuery } from "../hooks/useQuery.js";
import { MatchedRoute } from "../hooks/useMatchedRoutes.js";

export interface RouteDescriptor<TTab extends RouteTab>
  extends Omit<PathRouteProps, "index" | "children"> {
  path?: string;
  tab?: Constructable<TTab>;
  type?: string;
  children?: RouteDescriptor<TTab>[];
  index?: boolean;
  initializeTypesOnAdd?: string[];
  forceInitialization?: boolean;
}

interface RecursiveRouteProps<TTab extends RouteTab> {
  routes: RouteDescriptor<TTab>[];
  query?: Record<string, string>;
  matchedRoutes?: MatchedRoute<TTab>[];
}

interface GetComponentProps<TTab extends RouteTab> {
  query?: Record<string, string>;
  matchedRoutes: MatchedRoute<TTab>[];
  route: RouteDescriptor<TTab>;
  Component: React.ComponentType<any> | null | undefined;
}

const getComponent = <TTab extends RouteTab>({
  matchedRoutes,
  route,
  Component,
  query,
}: GetComponentProps<TTab>) => {
  if (Component) return Component;

  const currentRouteMatch = matchedRoutes.find((m) => m.route === route);

  if (!currentRouteMatch) return;
  if (!currentRouteMatch.route.tab) return;

  const TabConstructor = currentRouteMatch.route.tab;

  const getTab = () => {
    const tab = new TabConstructor(currentRouteMatch.params, query);
    return tab.renderScreen();
  };

  return getTab;
};

const recursiveRoute = <TTab extends RouteTab>({
  routes,
  query,
  matchedRoutes,
}: RecursiveRouteProps<TTab>) => {
  return routes.map((route) => {
    const {
      path,
      children: children,
      element,
      Component: ComponentProp,
      ...props
    } = route;

    const Component = getComponent({
      Component: ComponentProp,
      matchedRoutes: matchedRoutes ?? [],
      route,
      query,
    });

    if (children) {
      return (
        // @ts-expect-error: index cannot be resolved
        <Route
          key={path}
          path={path}
          element={element}
          Component={Component}
          {...props}
        >
          {recursiveRoute({
            routes: children,
            query,
            matchedRoutes,
          })}
        </Route>
      );
    }

    return (
      // @ts-expect-error: index cannot be resolved
      <Route
        key={path}
        path={path}
        element={element}
        Component={Component}
        {...props}
      />
    );
  });
};

export const RecursiveRoute = <TTab extends RouteTab>({
  routes,
}: RecursiveRouteProps<TTab>) => {
  const query = useQuery();
  const location = useLocation();

  const matchedRoutes = matchRoutes(
    routes as any[],
    location.pathname
  ) as MatchedRoute<TTab>[];

  return <Routes>{recursiveRoute({ routes, query, matchedRoutes })}</Routes>;
};
