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

- the reference section (`/documentation/developer-reference/visual-editor-api/`) — an overview with an auto-generated methods table, plus one page per object type, and
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
- Object interface descriptions name their origin ("This object is returned by … Additionally, you can …"); property descriptions are complete sentences ("This property holds/provides …").
- Event listeners: `addEventListener`/`removeEventListener` documented on all six interfaces, each with an example (using a named handler, since an anonymous listener can't be removed). Each description focuses on the listener itself (events, scope, teardown); the `event.detail` payload (`isNew`, `sourcePath`) is documented once, independently, in the reference's Events section rather than repeated in every listener.

Comments only — no type/signature changes in this branch.

## Open type follow-ups (maintainer)

These need type changes the docs pass can't make, and would each improve the generated reference.

### 1. Give `event.detail` a typed shape (new)

`addEventListener`/`removeEventListener` use the standard DOM listener type, so `event.detail` is untyped (`any`). The docs describe it in prose, but the reference can't surface it as a first-class type the way it now does for `FileMetadata`.

The payload has two fields:
- `isNew: boolean` — `true` when a `change` fired for a newly created file, `false` for an update.
- `sourcePath: string` — the changed file's path. Present on the Site-wide (`CloudCannonVisualEditorAPIV1`), `Collection`, and `Dataset` listeners. The `File`, `FileData`, and `FileContent` listeners are already scoped to a single known file, so their events don't include it.

Suggested: define a `CustomEvent`-style detail interface (e.g. `FileChangeEventDetail { sourcePath: string; isNew: boolean }`, plus a narrower variant without `sourcePath` for the file-scoped listeners if worth distinguishing) and type the listener signatures against it. Low breaking risk — it narrows an untyped value to a real shape. Parallel in spirit to the `FileMetadata` typing.

This pairs with a deliberate docs decision: the per-interface `addEventListener` descriptions now document only the listener (events, scope, teardown) and treat `event.detail` as an independent detail, defined once in the reference's Events section. Typing `event.detail` would give that detail a real home — each listener could link to the `event.detail` type the same way return types already link to their object pages, instead of relying on the prose Events section.

### 2. `File` methods that resolve `undefined` on a missing file (done in this branch — please confirm)

`File.get()`, `claimLock()`, and `releaseLock()` document resolving `undefined` when the file doesn't exist, but their return types didn't reflect it. To keep the types accurate, this branch narrowed them:
- `get(): Promise<string | undefined>`
- `claimLock(): Promise<{ readOnly: boolean } | undefined>`
- `releaseLock(): Promise<{ readOnly: boolean } | undefined>`

This is the one place the docs pass touched types (everything else is comments only), done because the prose already promised the behavior and `metadata()`/`getInputConfig()` already model it. Please confirm it matches the implementation.

One specific inconsistency the JSDoc review surfaced: **`FileContent.get()` is typed `Promise<string>` but its prose says it resolves to `undefined` when the file doesn't exist.** `FileData.get()` already returns `Record<string, any> | any[] | undefined`, so `FileContent.get()` is the outlier — narrow it to `Promise<string | undefined>` to match its own prose and `FileData.get()` (confirm against the implementation).

### 3. Give `FileData.get` a named options interface (optional cleanup)

`FileData.get` (`data.get`) is the only option-taking method whose options are an **inline literal** (`get(options?: { slug?: string })`) rather than a named, documented interface like every other option method (`SetOptions`, `AddArrayItemOptions`, `GetInputConfigOptions`, …).

The missing-description symptom is **already fixed in this branch** by adding a doc comment to the inline field, so the reference now renders `slug` with a description like every other option method:

```ts
get(options?: {
  /** The slug of a single field to read, instead of the whole object. */
  slug?: string;
}): Promise<Record<string, any> | any[] | undefined>;
```

This is purely optional cleanup now: extracting the literal into a named `GetDataOptions` interface would make it consistent in *shape* with the other option methods (and easier to reuse), but it's no longer needed to get a documented parameter. Low breaking risk — same shape, just named.

### 4. `AddArrayItemOptions.value` is typed required but documented as optional

`value: any` is required in the type, but `data.addArrayItem` documents it as an either/or with `sourceIndex` ("Provide either `value` for a new item, or `sourceIndex` to clone an existing one"). If that's the real behavior, `value` should be `value?: any`. Please confirm against the implementation.

### 5. V0 `'create'` event in the listener union (low priority, app-internal)

The app's `addEventListener` union accepts `'change' | 'delete' | 'create'`, but `triggerFileEvent()` only ever dispatches `'change'` or `'delete'` (creation is a `'change'` with `event.detail.isNew === true`). The published `index.d.ts` is already correct (`'change' | 'delete'` only) — this is just app-side cleanup: drop `'create'` or actually dispatch it.

### 6. `FileMetadata.last_modified` is typed `string | Date` (likely serialization-inaccurate)

`last_modified` is typed `string | Date | null`, but `created_at` (the sibling field) is `string | null`. Metadata crosses the API/`postMessage` boundary, where a `Date` instance wouldn't survive serialization, so `last_modified` is almost certainly a `string` (or `null`) in practice too. If so, drop the `Date` so it matches `created_at`. The JSDoc also diverges as a result (`created_at` is documented as an "ISO 8601 timestamp", `last_modified` only as "a timestamp"); once the type is fixed, the descriptions can match. Please confirm against the implementation.

### 7. `data.upload` reuses `EditOptions`, surfacing edit-only fields

`upload(file: File, options: EditOptions)` reuses the `edit()` options interface, so the generated reference lists `style` and `position` as `upload` parameters with edit-specific descriptions ("the field to open for editing", "used to position the panel"). But the handler (`file:upload-asset-file` in the app) only reads `slug` from those options. `style` and `position` are forwarded by the API and silently ignored on upload.

Give `upload` its own options interface with just the field it uses:

```ts
export interface UploadOptions {
  /** The slug of the field to upload to. */
  slug: string;
}
// upload(file: File, options: UploadOptions): Promise<string | undefined>
```

Then the reference stops showing `style`/`position` (which don't apply) and `slug` gets an upload-appropriate description. The docs pass can't fix this from comments alone, because the rendered fields come from `EditOptions`. Please confirm against the implementation that `style`/`position` are genuinely unused for uploads. (Low breaking risk — it narrows an options object that already only needs `slug`.)

### 8. Name the inline `position` object-literal type

`EditOptions.position` (also reached via `data.upload` and `createTextEditableRegion`-adjacent option shapes) is an inline literal:

```ts
position?: { x: number; y: number; left: number; width: number; top: number; height: number };
```

Because it has no name, the reference prints the whole six-field literal as the parameter's type, which renders as a long, wrapping code block that looks out of place next to short types like `string`. Extracting it into a named interface:

```ts
export interface PanelPosition {
  x: number;
  y: number;
  left: number;
  width: number;
  top: number;
  height: number;
}
```

would make the parameter's type render as a short `PanelPosition` token (and link to its own entry), like every other named type. Pure readability improvement; no behavior change.

### 9. No `datasets()` to match `collections()`

The API Object has `collections()` (lists every Collection) but no `datasets()` equivalent — there's no way to list all Datasets. The `Dataset` JSDoc previously claimed it was "Returned by the `dataset()` and `datasets()` methods"; since `datasets()` exists in neither the types nor the app, that reference has been corrected to `dataset()` only.

Decide which way to resolve the asymmetry:
- If listing all Datasets should be supported, add `datasets(): Promise<CloudCannonVisualEditorAPIV1Dataset[]>` (mirroring `collections()`), and the `Dataset` description can list it again.
- If it's intentional that Datasets aren't listable, no code change needed — just confirming the asymmetry is by design.

## Already handled (for the record)

Resolved in earlier maintainer pushes, noted so they aren't re-flagged: `set(content: string)`, `get(options?: { slug?: string })` (dead `rewriteUrls` removed), `metadata(): Promise<FileMetadata | undefined>` + the `FileMetadata` interface, `setLoading(): Promise<void>`, and removal of the unused error interfaces.
