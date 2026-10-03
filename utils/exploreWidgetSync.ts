import type { ExploreWidgetConfig } from "../types/widgets";

export type WidgetSettings = {
  schemaVersion: 2;
  widgets: ExploreWidgetConfig[];
  revision: number;
  updatedAt: string;
};
export type WidgetSettingsCache = {
  version: 2;
  widgets: ExploreWidgetConfig[];
  revision: number | null;
  pending: boolean;
};
export type WidgetSyncState = {
  widgets: ExploreWidgetConfig[];
  ready: boolean;
  pending: boolean;
  error: string | null;
  conflict: boolean;
};
type Dependencies = {
  load: () => Promise<WidgetSettingsCache | null>;
  persist: (cache: WidgetSettingsCache) => Promise<void>;
  get: () => Promise<WidgetSettings | null>;
  put: (widgets: ExploreWidgetConfig[], revision: number) => Promise<WidgetSettings>;
  onChange: (state: WidgetSyncState) => void;
};

/** One account/session owns each instance. Network and disk writes are serialized. */
export class ExploreWidgetSync {
  state: WidgetSyncState = { widgets: [], ready: false, pending: false, error: null, conflict: false };
  private cache: WidgetSettingsCache | null = null;
  private stopped = false;
  private writing: Promise<void> = Promise.resolve();
  private syncing: Promise<void> | null = null;
  private starting: Promise<void> | null = null;
  private edits = 0;
  private hasLocalConfiguration = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(private dependencies: Dependencies) {}

  private emit() {
    if (!this.stopped) this.dependencies.onChange({ ...this.state });
  }
  private persist(cache = this.cache) {
    const snapshot = JSON.parse(JSON.stringify(cache)) as WidgetSettingsCache;
    this.writing = this.writing.catch(() => {}).then(() => this.dependencies.persist(snapshot));
    return this.writing;
  }
  start(): Promise<void> {
    if (this.starting) return this.starting;
    this.starting = this.initialize().finally(() => { this.starting = null; });
    return this.starting;
  }
  private async initialize() {
    try {
      const cache = await this.dependencies.load();
      if (this.stopped) return;
      this.hasLocalConfiguration = cache !== null;
      this.cache = cache ?? { version: 2, widgets: [], revision: null, pending: false };
      this.state = { ...this.state, widgets: this.cache.widgets, ready: true, pending: this.cache.pending };
      this.emit();
      await this.refresh();
    } catch {
      this.state.error = "Unable to read saved widget settings. Try again.";
      this.emit();
    }
  }
  edit(update: (widgets: ExploreWidgetConfig[]) => ExploreWidgetConfig[]) {
    if (this.stopped || !this.cache || !this.state.ready) return;
    const widgets = update(this.cache.widgets);
    if (widgets === this.cache.widgets) return;
    this.hasLocalConfiguration = true;
    this.edits += 1;
    this.cache = { ...this.cache, widgets, pending: true };
    this.state = { ...this.state, widgets, pending: true };
    this.emit();
    void this.persist().catch(() => {
      this.state.error = "Unable to save widgets on this device. Try again.";
      this.emit();
    });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { void this.refresh(); }, 500);
  }
  refresh(): Promise<void> {
    if (this.stopped || this.state.conflict) return Promise.resolve();
    if (!this.cache) return this.start();
    if (this.syncing) return this.syncing;
    this.syncing = this.run().finally(() => { this.syncing = null; });
    return this.syncing;
  }
  private async run() {
    try {
      if (!this.cache) return;
      if (!this.cache.pending || this.cache.revision === null) {
        const edits = this.edits;
        const remote = await this.dependencies.get();
        if (this.stopped) return;
        if (remote) {
          if (this.cache.pending && (this.cache.revision === null || edits !== this.edits)) {
            // A dirty known revision can be saved safely using compare-and-swap.
            if (this.cache.revision === null) throw { response: { status: 409 } };
          } else if (edits === this.edits) {
            this.cache = { version: 2, widgets: remote.widgets, revision: remote.revision, pending: false };
          }
        } else {
          // Import existing local settings only after a successful absent-server read.
          this.cache = { ...this.cache, revision: 0, pending: this.cache.pending || this.hasLocalConfiguration };
        }
      }
      while (this.cache.pending && !this.stopped) {
        await this.persist(); // Do not acknowledge a save before its local snapshot is durable.
        if (this.stopped) return;
        const snapshot = this.cache;
        const edits = this.edits;
        const saved = await this.dependencies.put(snapshot.widgets, snapshot.revision!);
        if (this.stopped) return;
        this.cache = { ...this.cache, revision: saved.revision,
          widgets: edits === this.edits ? saved.widgets : this.cache.widgets,
          pending: edits !== this.edits };
        await this.persist();
      }
      if (this.stopped) return;
      await this.persist();
      this.state = { ...this.state, widgets: this.cache.widgets, pending: this.cache.pending, error: null };
      this.emit();
    } catch (error) {
      if (this.stopped) return;
      const conflict = (error as { response?: { status?: number } })?.response?.status === 409;
      this.state = { ...this.state, pending: this.cache?.pending ?? false, conflict,
        error: conflict
          ? "Widgets changed on another device. Your edits are saved here. Reload account settings to use the other device’s version."
          : "Widget settings could not sync. Your edits will retry when you return to the app." };
      this.emit();
    }
  }
  /** Explicit user action discards pending local edits only after a successful read. */
  async reloadAccountSettings() {
    if (this.syncing) await this.syncing;
    if (this.stopped) return;
    try {
      const edits = this.edits;
      const remote = await this.dependencies.get();
      if (this.stopped) return;
      if (edits !== this.edits) throw new Error("Settings edited while reloading");
      const replacement: WidgetSettingsCache = { version: 2, widgets: remote?.widgets ?? [], revision: remote?.revision ?? 0, pending: false };
      await this.persist(replacement);
      if (this.stopped) return;
      if (edits !== this.edits) throw new Error("Settings edited while reloading");
      this.cache = replacement;
      this.state = { widgets: this.cache.widgets, ready: true, pending: this.cache.pending, conflict: false, error: null };
      this.emit();
    } catch {
      this.state.error = "Unable to reload account widget settings. Your local edits are still saved.";
      this.emit();
    }
  }
  stop() { this.stopped = true; clearTimeout(this.timer); }
}
