export interface KeyValueStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  delete?(key: string): Promise<void>;
}

export class MemoryStore implements KeyValueStore {
  #values = new Map<string, unknown>();
  async get<T>(key: string): Promise<T | undefined> { return this.#values.get(key) as T | undefined; }
  async set<T>(key: string, value: T): Promise<void> { this.#values.set(key, value); }
  async delete(key: string): Promise<void> { this.#values.delete(key); }
}

export interface VersionedEnvelope<T> { schemaVersion: number; value: T }
export type Migration = (value: unknown) => unknown;
export function isVersionedEnvelope(value: unknown): value is VersionedEnvelope<unknown> {
  return Boolean(value && typeof value === 'object' && Number.isInteger((value as VersionedEnvelope<unknown>).schemaVersion) && 'value' in value);
}
export function migrateEnvelope<T>(input: unknown, targetVersion: number, migrations: ReadonlyMap<number, Migration>): VersionedEnvelope<T> {
  if (!Number.isInteger(targetVersion) || targetVersion < 1) throw new Error('targetVersion must be a positive integer.');
  let version = isVersionedEnvelope(input) ? input.schemaVersion : 0;
  let value = isVersionedEnvelope(input) ? input.value : input;
  if (version > targetVersion) throw new Error(`Stored schema v${version} is newer than supported v${targetVersion}.`);
  while (version < targetVersion) {
    const migration = migrations.get(version);
    if (!migration) throw new Error(`Missing storage migration v${version} -> v${version + 1}.`);
    value = migration(value); version += 1;
  }
  return { schemaVersion: version, value: value as T };
}
export class VersionedStore<T> {
  constructor(private readonly store: KeyValueStore, private readonly key: string, private readonly targetVersion: number, private readonly migrations: ReadonlyMap<number, Migration>) {}
  async read(): Promise<VersionedEnvelope<T> | undefined> {
    const stored = await this.store.get<unknown>(this.key);
    return stored === undefined ? undefined : migrateEnvelope<T>(stored, this.targetVersion, this.migrations);
  }
  async write(value: T): Promise<void> { await this.store.set(this.key, { schemaVersion: this.targetVersion, value } satisfies VersionedEnvelope<T>); }
}
