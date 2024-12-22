export interface RouterTabsStore<TTab> {
  get: () => TTab[];
  set: (tabs: TTab[]) => void;
  setLastFocusTab: (tab: TTab) => void;
  getLastFocusTab: () => TTab | undefined;
}
