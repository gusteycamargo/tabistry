/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface RenderTab {
  onChange: () => void;
  onRemove: () => void;
  isSelected: boolean;
}

export abstract class RouteTab<
  TRouteParams extends object = {},
  TQueryParams extends object = {}
> {
  abstract type: string;
  constructor(readonly params: TRouteParams, readonly query: TQueryParams) {}
  abstract renderTab(props: RenderTab): JSX.Element | null;
  abstract renderScreen(): JSX.Element | null;
  onFocus?(): void;
  onBlur?(): void;
  onAdd?(): void;
  onRemove?(): void;
}
