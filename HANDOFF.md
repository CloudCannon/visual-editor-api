# Visual Editor API — docs handoff

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

This is the one place the docs pass touched types (everything else is comments only), done because the prose already promised the behavior and `metadata()`/`getInputConfig()` already model it. Please confirm it matches the implementation — and if `FileContent.get()` / `FileData.get()` resolve `undefined` on a missing file too, they likely want the same treatment (not changed here).

### 3. Give `FileData.get` a named options interface

`FileData.get` (`data.get`) is the only option-taking method whose options are an **inline literal** (`get(options?: { slug?: string })`) rather than a named, documented interface like every other option method (`SetOptions`, `AddArrayItemOptions`, `GetInputConfigOptions`, …). Because the inline `slug` carries no JSDoc, the reference now renders its parameter as `slug` (`string`, optional) **with no description**, while `getInputConfig` shows `slug` *with* one. It's the one inconsistent option method.

Give it a named interface with a documented field:

```ts
export interface GetDataOptions {
  /** The slug of a single field to read, instead of the whole object. */
  slug?: string;
}
// get(options?: GetDataOptions): Promise<Record<string, any> | any[] | undefined>
```

Then its parameter gets a real description and matches the rest. Low breaking risk — same shape, just named. (Lighter alternative: add a doc comment to the inline field.)

### 4. `AddArrayItemOptions.value` is typed required but documented as optional

`value: any` is required in the type, but `data.addArrayItem` documents it as an either/or with `sourceIndex` ("Provide either `value` for a new item, or `sourceIndex` to clone an existing one"). If that's the real behavior, `value` should be `value?: any`. Please confirm against the implementation.

### 5. V0 `'create'` event in the listener union (low priority, app-internal)

The app's `addEventListener` union accepts `'change' | 'delete' | 'create'`, but `triggerFileEvent()` only ever dispatches `'change'` or `'delete'` (creation is a `'change'` with `event.detail.isNew === true`). The published `index.d.ts` is already correct (`'change' | 'delete'` only) — this is just app-side cleanup: drop `'create'` or actually dispatch it.

## Already handled (for the record)

Resolved in earlier maintainer pushes, noted so they aren't re-flagged: `set(content: string)`, `get(options?: { slug?: string })` (dead `rewriteUrls` removed), `metadata(): Promise<FileMetadata | undefined>` + the `FileMetadata` interface, `setLoading(): Promise<void>`, and removal of the unused error interfaces.
