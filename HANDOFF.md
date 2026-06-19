# Visual Editor API — docs handoff

## Previewing your JSDoc edits in the docs locally

You can see how your `src/index.d.ts` changes will render in the reference before publishing, as long as both repos are checked out as siblings in the same parent folder:

```
your-workspace/
├── visual-editor-api/        ← this repo (edit src/index.d.ts here)
└── platform-documentation/   ← the docs site
```

Then, from the `platform-documentation` repo:

```sh
VEAPI_LOCAL=1 deno task serve
```

Open the reference at **http://localhost:9010/documentation/developer-reference/visual-editor-api/**.

- `VEAPI_LOCAL=1` tells the docs parser to read your local `../visual-editor-api/src/index.d.ts` working tree instead of the published npm version, so your unpublished JSDoc edits show up live. Without it, the docs build against the pinned release (see "To ship a documentation change" below) and you'll see the shipped reference, not your edits.
- The JSDoc is parsed once when the serve task starts. The sibling repo sits outside the docs site's watch tree, so if you edit `src/index.d.ts` while the server is running and the page doesn't update, restart the serve task to re-parse.
- Don't run `deno task build` and `deno task serve` at the same time — they both write to `_site` and will clash.

## How the documentation consumes this package

The JSDoc in `src/index.d.ts` **is** the CloudCannon developer reference for the Visual Editor API. The `platform-documentation` site parses it at build time (with ts-morph) into:

- the reference section (`/documentation/developer-reference/visual-editor-api/`) — an overview, an "API Object" page listing the top-level methods, and one page per object type, and
- the reference data tables embedded in the VE API how-to articles.

**All of that machinery lives on the docs side.** `platform-documentation` fetches `src/index.d.ts` from the npm CDN (jsDelivr), pinned by version, so the reference builds in CI without this repo checked out. This repo stays lean: types + JSDoc only — no parser, no build step beyond the existing `cp src/* dist/`.

### To ship a documentation change

1. Edit the JSDoc in `src/index.d.ts`.
2. Tag a release (`v*`) — CI publishes to npm as today.
3. The docs team bumps the pinned version in `platform-documentation` (`_lib/veapi-docs.ts` → `VEAPI_VERSION`). That single edit is the whole re-pin.

There is nothing else to wire up on this side.

## What's in the `docs/jsdocs-review` branch

A full JSDoc rewrite, written from the implementation (the previous JSDoc was AI-generated and unreliable — e.g. `@throws {FileNotFoundError}` / `{CollectionNotFoundError}` that are never thrown). Highlights:

- Hallucinated `@throws` removed; only the four real `Error` cases documented. Real failure modes (resolve-`undefined`, the `items()` falsy-key hang) described instead.
- `@example` on every method; consistent present-tense voice; CloudCannon terminology capitalized; no em dashes.
- Object interface descriptions name their origin ("Represents … Returned by / Accessed through … Additionally, you can …"); property descriptions are blunt, verb-first sentences ("Holds … / Provides …").
- Event listeners: `addEventListener`/`removeEventListener` documented on all six interfaces, each with an example (using a named handler, since an anonymous listener can't be removed). Each description focuses on the listener itself (events, scope, teardown); the `event.detail` payload (`isNew`, `sourcePath`) is documented once, independently, in the reference's Events section rather than repeated in every listener.

Comments only, apart from one verified return-type narrowing (the `undefined`-on-missing-file change, detailed in Tier 1 below).

## Open type follow-ups (maintainer)

Grouped by priority. **Tier 1** are real inaccuracies worth fixing. **Tier 2** need a quick check against the implementation. **Tier 3** is optional polish — leaving these as-is is a reasonable design choice, especially where a value is intentionally open-shaped.

### Tier 1 — Correctness (real inaccuracies)

#### `File` / `FileContent` methods resolve `undefined` on a missing file

`File.get()`, `claimLock()`, and `releaseLock()` document resolving `undefined` when the file doesn't exist, but their return types didn't reflect it. This branch narrowed them (the one place the docs pass touched types):
- `get(): Promise<string | undefined>`
- `claimLock(): Promise<{ readOnly: boolean } | undefined>`
- `releaseLock(): Promise<{ readOnly: boolean } | undefined>`

The behavior is grounded in the app, not assumed from prose: the message handler short-circuits *before* dispatching any file action and posts back `undefined` whenever the `sourcePath` can't be resolved to a file (`app/assets/javascripts/views/file/visual-iframe.view.ts`):

```js
if (!file?.commitChange) {
  this.postMessage(`${message.action}-response`, undefined, message.editorCallbackId);
  return;
}
```

Every method routed through this handler (`get`, `set`, `metadata`, `claimLock`, `releaseLock`, `getInputConfig`, and the `data`/`content` methods) therefore receives `undefined` for a non-existent file. Most client methods pass that straight through (`File.get` uses `typeof value === 'string' ? … : value`; `claimLock`/`releaseLock` resolve the raw value), so they resolve to `undefined` cleanly. The narrowed return types reflect that; `metadata()`/`getInputConfig()` already modelled it.

**Still to do — and it's a client bug, not just a type:** `FileContent.get()` does **not** resolve `undefined` cleanly. Its client code is `resolve(value.content)` with no guard, unlike every sibling getter — so on a missing file `value` is `undefined`, `value.content` throws, and the promise never resolves. Its documented "Resolves to `undefined` if the file does not exist" is therefore currently false. Two ways to fix:
- **Make it behave like the others** — change the client to `resolve(value?.content)`, then it resolves `undefined`, and the published type should become `Promise<string | undefined>` (currently `Promise<string>`). This is the consistent option.
- **Or document reality** — if `FileContent.get` is meant to throw on a missing file, change the prose to say so (it would then differ from `File.get`/`FileData.get`, which resolve `undefined`).

(`FileData.get` already resolves `undefined` cleanly and returns `Record<string, any> | any[] | undefined`; `FileContent.get` is the lone outlier.)

#### `data.upload` reuses `EditOptions`, surfacing fields it ignores

`upload(file: File, options: EditOptions)` reuses the `edit()` options interface, so the generated reference lists `style` and `position` as `upload` parameters with edit-specific descriptions ("the field to open for editing", "used to position the panel"). But the handler (`file:upload-asset-file` in the app) only reads `slug` from those options — `style` and `position` are forwarded by the API and silently ignored on upload (verified against the implementation).

Give `upload` its own options interface with just the field it uses:

```ts
export interface UploadOptions {
  /** The slug of the field to upload to. */
  slug: string;
}
// upload(file: File, options: UploadOptions): Promise<string | undefined>
```

Then the reference stops showing `style`/`position` (which don't apply) and `slug` gets an upload-appropriate description. The docs pass can't fix this from comments alone, because the rendered fields come from `EditOptions`. (The fix is your call — a dedicated `UploadOptions` is the clean option; keeping the shared `EditOptions` is also fine, the docs just live with the extra fields. Low breaking risk either way.)

#### `FileMetadata.last_modified` is typed `string | Date`, but the client always receives a string

The published `FileMetadata.last_modified` is `string | Date | null`, while its sibling `created_at` is `string | null`. The `Date` is inaccurate for what the VE API client receives: the metadata handler serializes the payload with `JSON.stringify(file.metadata)` and the client `JSON.parse`s it, so any `Date` is converted to an ISO 8601 string in transit (`JSON.stringify` invokes `Date.prototype.toJSON`). The client therefore always receives `string | null`, never a `Date`.

The `Date` most likely leaked from the app's internal model (`app/assets/javascripts/models/site-file.ts`: `last_modified: string | Date | null`), which is the *pre-serialization* type. Drop `Date` from the published `FileMetadata` so it matches `created_at` and reality; the descriptions can then align (`created_at` is documented as an "ISO 8601 timestamp", `last_modified` currently just "a timestamp").

#### `FileData.addEventListener` / `FileContent.addEventListener` never fire

The reference documents `change` listeners on `FileData` (`data`) and `FileContent` (`content`), each with an example — but they never receive events. The client registers them on `CloudCannon:file:{path}:data:change` and `…:content:change` (`APIFileData`/`APIFileContent.eventPrefix` append `:data` / `:content`), but `triggerFileEvent` only dispatches:

- `CloudCannon:file:{path}:{change|delete}` — the File-level listener
- `CloudCannon:{change|delete}` — Site-wide
- `CloudCannon:collection:{key}:{change|delete}` and `CloudCannon:dataset:{key}:{change|delete}`

There is no `:data:` or `:content:` dispatch anywhere in the app — `APIEvents.dispatchEvent` is only called in those four places (in `cloudcannon-v1-api.ts`). So the `data`/`content` `change` listeners are dead; only `File.addEventListener` fires for file changes.

Resolve one way or the other:
- **If they should work:** dispatch matching `:data:`/`:content:` events (from `triggerFileEvent`, or wherever data/content changes are detected).
- **If not:** remove them from the API and the docs, and point integrators to `File.addEventListener`, which already fires on any change to the file.

### Tier 2 — Confirm against the implementation

#### `AddArrayItemOptions.value` — required, or optional vs `sourceIndex`?

`value: any` is required in the type, but `data.addArrayItem` documents it as an either/or with `sourceIndex` ("Provide either `value` for a new item, or `sourceIndex` to clone an existing one"). If that's the real behavior, `value` should be `value?: any`. This is about the *optionality* (`?`), not the `any` — keeping `value` loosely typed is correct. Please confirm against the implementation.

#### No `datasets()` to match `collections()` — intended?

The API Object has `collections()` (lists every Collection) but no `datasets()` equivalent — there's no way to list all Datasets. The `Dataset` JSDoc previously claimed it was "Returned by the `dataset()` and `datasets()` methods"; since `datasets()` exists in neither the types nor the app, that reference has been corrected to `dataset()` only.

Decide which way to resolve the asymmetry:
- If listing all Datasets should be supported, add `datasets(): Promise<CloudCannonVisualEditorAPIV1Dataset[]>` (mirroring `collections()`), and the `Dataset` description can list it again.
- If it's intentional that Datasets aren't listable, no code change needed — just confirming the asymmetry is by design.

### Tier 3 — Optional (readability / consistency; fine to leave by design)

#### Give `event.detail` a typed shape

`addEventListener`/`removeEventListener` use the standard DOM listener type, so `event.detail` is untyped (`any`). The docs describe it in prose, but the reference can't surface it as a first-class type the way it now does for `FileMetadata`. The payload has two fields:
- `isNew: boolean` — `true` when a `change` fired for a newly created file, `false` for an update.
- `sourcePath: string` — the changed file's path. Present on the Site-wide (`CloudCannonVisualEditorAPIV1`), `Collection`, and `Dataset` listeners. The `File`, `FileData`, and `FileContent` listeners are already scoped to a single known file, so their events don't include it.

If you want it typed, define a `CustomEvent`-style detail interface (e.g. `FileChangeEventDetail { sourcePath: string; isNew: boolean }`, plus a narrower variant without `sourcePath` for the file-scoped listeners) and type the listener signatures against it — then each listener could link to the `event.detail` type instead of relying on the prose Events section. **But if event payloads are meant to stay open or evolve, leaving `event.detail` as `any` is a reasonable choice** — this is a docs-rendering nicety, not a correctness issue.

#### Name `FileData.get`'s inline options (`GetDataOptions`)

`FileData.get` (`data.get`) is the only option-taking method whose options are an inline literal (`get(options?: { slug?: string })`) rather than a named interface like every other option method. The missing-description symptom is **already fixed in this branch** by adding a doc comment to the inline field, so `slug` now renders with a description. Extracting it into a named `GetDataOptions` interface would only make it consistent in *shape* with the others (and easier to reuse) — purely optional now.

#### Name the inline `position` type (`PanelPosition`)

`EditOptions.position` is an inline literal:

```ts
position?: { x: number; y: number; left: number; width: number; top: number; height: number };
```

Because it has no name, the reference prints the whole six-field literal as the parameter's type, which renders as a long, wrapping block next to short types like `string`. Extracting it into a named interface (e.g. `PanelPosition`) would make the parameter render as a short token that links to its own entry. Pure readability; no behavior change.

#### V0 `'create'` event in the listener union (app-internal)

The app's `addEventListener` union accepts `'change' | 'delete' | 'create'`, but `triggerFileEvent()` only ever dispatches `'change'` or `'delete'` (creation is a `'change'` with `event.detail.isNew === true`). The published `index.d.ts` is already correct (`'change' | 'delete'` only) — this is just app-side cleanup: drop `'create'` or actually dispatch it.

## Already handled (for the record)

Resolved in earlier maintainer pushes, noted so they aren't re-flagged: `set(content: string)`, `get(options?: { slug?: string })` (dead `rewriteUrls` removed), `metadata(): Promise<FileMetadata | undefined>` + the `FileMetadata` interface, `setLoading(): Promise<void>`, and removal of the unused error interfaces.
