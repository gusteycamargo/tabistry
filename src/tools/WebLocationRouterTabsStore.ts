import { type RouterTabsStore } from "../interfaces/IRouterTabsStore.js";

export interface WebLocationTabsStorageOptions<TTabPayload> {
  getDefaultTabs?: () => TTabPayload[];
}

export class WebLocationRouterTabsStore<TTab> implements RouterTabsStore<TTab> {
  constructor(
    public readonly identifier: string,
    public readonly options: WebLocationTabsStorageOptions<TTab> = {}
  ) {}

  public get(): TTab[] {
    const item = localStorage.getItem(`${this.identifier}:router-tabs`);
    if (item) return JSON.parse(item);

    if (!this.options.getDefaultTabs) return [];
    const tabs = this.options.getDefaultTabs();

    this.set(tabs);

    return tabs;
  }

  public set(tabs: TTab[]): void {
    localStorage.setItem(
      `${this.identifier}:router-tabs`,
      JSON.stringify(tabs)
    );
  }

  public setLastFocusTab(tab: TTab): void {
    localStorage.setItem(
      `${this.identifier}:router-tabs:last-focus-tab`,
      JSON.stringify(tab)
    );
  }

  public getLastFocusTab(): TTab | undefined {
    const item = localStorage.getItem(
      `${this.identifier}:router-tabs:last-focus-tab`
    );

    if (!item) return undefined;

    return JSON.parse(item);
  }

  public destroy() {
    localStorage.removeItem(`${this.identifier}:router-tabs`);
    localStorage.removeItem(`${this.identifier}:router-tabs:last-focus-tab`);
  }

  public destroyByPattern(pattern: string) {
    if (!localStorage.length) return;

    new Array(localStorage.length).fill(null).forEach((_, i) => {
      const key = localStorage.key(i);
      if (key?.includes(pattern)) {
        localStorage.removeItem(key);
        this.destroyByPattern(pattern);
      }
    });
  }
}
