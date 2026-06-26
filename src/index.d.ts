import type {
	Cascade,
	FileInput,
	Input,
	InputType,
	RichTextInput,
	Structure,
	StructureValue,
	UrlInput,
} from '@cloudcannon/configuration-types';

/**
 * Options for `createCustomDataPanel`, which opens a custom Data Panel in the
 * Visual Editor using CloudCannon's Input types.
 */
export interface CreateCustomDataPanelOptions {
	/**
	 * A stable identifier for the panel. Pass it to `destroyCustomDataPanel` to
	 * close the panel. When omitted, CloudCannon generates a seven-character
	 * base-36 id (digits `0`-`9` and lowercase `a`-`z`, e.g. `k4j92xq`).
	 */
	id?: string;
	/** The heading shown at the top of the Data Panel. */
	title: string;
	/**
	 * Called whenever a Team Member changes a value in the panel. Receives the full
	 * updated data object, not a diff.
	 */
	onChange: (data?: Record<string, unknown> | unknown[]) => void;
	/**
	 * Initial values for the panel, keyed by Input name. Each key becomes an
	 * editable field configured by `config`.
	 */
	data?: Record<string, unknown> | unknown[];
	/**
	 * Input configuration for the fields in `data`, using the same `_inputs`
	 * shape as a CloudCannon Configuration File.
	 */
	config?: Cascade;
	/**
	 * A `DOMRect` (for example from `getBoundingClientRect()`) used to anchor the
	 * panel next to the control that opened it. When omitted, CloudCannon
	 * positions the panel.
	 */
	position?: DOMRect;
	/**
	 * When `true`, Inputs resolve against the previewed file and the Site
	 * configuration the same way hosted Data Panels do (for example, for
	 * Structure matching). When `false` (the default), only the `data` and
	 * `config` passed here are used.
	 */
	allowFullDataCascade?: boolean;
}

export type EditEvent = CustomEvent<{
	isNew: boolean;
	sourcePath: string;
}>;

type EditEventListener = (evt: EditEvent) => void;
interface EditEventListenerObject {
	handleEvent(object: EditEvent): void;
}

type EditEventListenerOrEventListenerObject = EditEventListener | EditEventListenerObject;
type EventListenerOptions = Parameters<EventTarget['addEventListener']>[2];

/**
 * Interface defining the public API for interacting with CloudCannon's Visual Editor.
 * This API provides methods for managing content, handling file operations, and controlling the editor's state.
 * @deprecated Use CloudCannonVisualEditorAPIV1 instead
 */
export interface CloudCannonVisualEditorAPIV0 {
	/** Whether event handling is currently enabled */
	eventsEnabled: boolean;
	/** Whether the API should be installed globally */
	installGlobally: boolean;

	/**
	 * Disables the global installation of the API
	 */
	disableGlobalInstall(): void;

	/**
	 * Enables event handling for the API
	 * This will also ensure the commit model is created
	 */
	enableEvents(): void;

	/**
	 * Disables event handling for the API
	 */
	disableEvents(): void;

	/**
	 * Refreshes the editor interface
	 * Note: This has been replaced with a MutationObserver in editor-overlays-view
	 */
	refreshInterface(): void;

	/**
	 * Triggers an update event for a specific file
	 * @param sourcePath - The path of the file to update
	 */
	triggerUpdateEvent(sourcePath: string): void;

	/**
	 * Sets the loading state of the editor
	 * @param loadingData - Optional loading state message
	 * @returns Promise that resolves when loading state is updated
	 */
	setLoading(loadingData: string | undefined): Promise<any>;

	/**
	 * Sets data for a specific field
	 * @param slug - The identifier of the field to set
	 * @param value - The value to set
	 * @returns Promise that resolves when the data is set
	 */
	set(slug: string, value: any): Promise<any>;

	/**
	 * Initiates editing of a specific field
	 * @param slug - The identifier of the field to edit
	 * @param style - Optional style information
	 * @param e - The mouse event that triggered the edit
	 */
	edit(slug: string, style: string | null, e: MouseEvent): void;

	/**
	 * Uploads a file to the editor
	 * @param file - The file to upload
	 * @param inputConfig - Optional configuration for the input
	 * @returns Promise that resolves with the path of the uploaded file
	 */
	uploadFile(
		file: File,
		inputConfig: RichTextInput | UrlInput | FileInput | undefined
	): Promise<string | undefined>;

	/**
	 * Adds an item to an array field
	 * @param slug - The identifier of the array field
	 * @param index - The position to insert at (null for end)
	 * @param value - The value to insert
	 * @param e - The mouse event that triggered the addition
	 * @returns Promise that resolves when the item is added
	 */
	addArrayItem(slug: string, index: number | null, value: any, e: MouseEvent): Promise<void>;

	/**
	 * Adds an item before a specific index in an array field
	 * @param slug - The identifier of the array field
	 * @param index - The index to insert before
	 * @param value - The value to insert
	 * @param e - The mouse event that triggered the addition
	 * @returns Promise that resolves when the item is added
	 */
	addArrayItemBefore(slug: string, index: number, value: any, e: MouseEvent): Promise<void>;

	/**
	 * Adds an item after a specific index in an array field
	 * @param slug - The identifier of the array field
	 * @param index - The index to insert after
	 * @param value - The value to insert
	 * @param e - The mouse event that triggered the addition
	 * @returns Promise that resolves when the item is added
	 */
	addArrayItemAfter(slug: string, index: number, value: any, e: MouseEvent): Promise<void>;

	/**
	 * Removes an item from an array field
	 * @param slug - The identifier of the array field
	 * @param index - The index of the item to remove
	 * @returns Promise that resolves when the item is removed
	 */
	removeArrayItem(slug: string, index: number): Promise<void>;

	/**
	 * Moves an item within an array field
	 * @param slug - The identifier of the array field
	 * @param index - The current index of the item
	 * @param toIndex - The target index for the item
	 * @returns Promise that resolves when the item is moved
	 */
	moveArrayItem(slug: string, index: number, toIndex: number): Promise<void>;

	/**
	 * Gets the current value of the editor
	 * @param options - Optional configuration for the value retrieval
	 * @returns Promise that resolves with the current value
	 */
	value(options?: { rewriteURLs?: boolean }): Promise<string>;

	/**
	 * Claims a lock on a file
	 * @param sourcePath - Optional path of the file to lock
	 * @returns Promise that resolves with the lock status
	 */
	claimLock(sourcePath?: string): Promise<{ readOnly: boolean }>;

	/**
	 * Releases a lock on a file
	 * @param sourcePath - Optional path of the file to unlock
	 * @returns Promise that resolves with the lock status
	 */
	releaseLock(sourcePath?: string): Promise<{ readOnly: boolean }>;

	/**
	 * Gets prefetched files
	 * @returns Promise that resolves with a record of file blobs
	 */
	prefetchedFiles(): Promise<Record<string, Blob>>;

	/**
	 * Loads legacy Bookshop information
	 * @returns Promise that resolves with the Bookshop data
	 */
	loadLegacyBookshopInfo(): Promise<any>;
}

/**
 * Options for `data.set()`.
 */
export interface SetOptions {
	/** The slug of the field to set. */
	slug: string;
	/** The new value for the field. */
	value: any;
}

/**
 * Options for `data.edit()`.
 */
export interface EditOptions {
	/** The slug of the target field. */
	slug: string;
	/** Set to `"sidebar"` to open the field in the Data Editor sidebar instead of a floating Data Panel. */
	style?: string | null;
	/** The click coordinates and the bounding rectangle of the element being edited, used to position the panel. */
	position?: {
		x: number;
		y: number;
		left: number;
		width: number;
		top: number;
		height: number;
	};
}

/**
 * Base options for the array-field operations.
 */
export interface ArrayOptions {
	/** The slug of the array field. */
	slug: string;
}

/**
 * Options for `data.addArrayItem()`.
 */
export interface AddArrayItemOptions extends ArrayOptions {
	/** The position to insert at. Pass `null` to append to the end. */
	index: number | null;
	/** The value to insert. Provide either `value` for a new item, or `sourceIndex` to clone an existing one. */
	value?: any;
	/** The index of an existing array item to clone, used instead of `value`. */
	sourceIndex?: number;
}

/**
 * Options for `data.moveArrayItem()`.
 */
export interface MoveArrayItemOptions {
	/** The slug of the array field to move the item from. */
	fromSlug: string;
	/** The slug of the array field to move the item to. Defaults to `fromSlug`. */
	toSlug?: string;
	/** The current index of the item. */
	fromIndex: number;
	/** The target index for the item. */
	toIndex: number;
}

/**
 * Options for `data.removeArrayItem()`.
 */
export interface RemoveArrayItemOptions extends ArrayOptions {
	/** The index of the item to remove. */
	index: number;
}

/**
 * Options for `getInputConfig()`.
 */
export interface GetInputConfigOptions {
	/** The slug of the field whose Input configuration to resolve. */
	slug: string;
}

/**
 * Represents metadata describing a file. Returned by the
 * `metadata()` method on a File.
 */
export interface FileMetadata {
	/**
	 * Holds the file's size in bytes (the length of its raw source), or `null` if unknown.
	 * @example
	 * In this example, we read the size of the file open in the editor.
	 * ```javascript
	 * const { file_size } = await api.currentFile().metadata();
	 * console.log(file_size);
	 * ```
	 */
	file_size: number | null;
	/**
	 * Holds an ISO 8601 timestamp of when the file was created, or `null` if unknown.
	 * @example
	 * In this example, we read when the file was created.
	 * ```javascript
	 * const { created_at } = await api.currentFile().metadata();
	 * console.log(`Created at ${new Date(created_at).toLocaleString()}`);
	 * ```
	 */
	created_at: string | null;
	/**
	 * Holds a timestamp of the file's most recent change, or `null` if unknown.
	 * @example
	 * In this example, we read when the file was last changed.
	 * ```javascript
	 * const { last_modified } = await api.currentFile().metadata();
	 * console.log(last_modified);
	 * ```
	 */
	last_modified: string | null;
	/**
	 * Holds the file's resolved output data: its front matter merged
	 * with the data CloudCannon's build produces for it. The shape depends on the
	 * file, so this is loosely typed.
	 * @example
	 * In this example, we read the file's resolved output data.
	 * ```javascript
	 * const { data } = await api.currentFile().metadata();
	 * console.log(data);
	 * ```
	 */
	data: any;
}

/**
 * Accessed through a File's `content` property. Provides body-content access for
 * a file: everything after the front matter. Additionally, you can read or
 * replace a file's body as a string.
 */
export interface CloudCannonVisualEditorAPIV1FileContent {
	/**
	 * Returns the file's body content (everything after the front matter) as a
	 * string. Resolves to `undefined` if the file does not exist.
	 * @returns A promise for the body content string.
	 * @example
	 * In this example, we read the body content of the file open in the editor and log it.
	 * ```javascript
	 * const content = await api.currentFile().content.get();
	 * console.log(content);
	 * ```
	 */
	get(): Promise<string | undefined>;

	/**
	 * Replaces the file's body content with the given string. This marks the file
	 * as having unsaved changes; a Team Member must save the Site to persist it.
	 * Has no effect if the file does not exist.
	 * @param content The new body content, as a string.
	 * @returns A promise that resolves once the change is applied to the editor.
	 * @example
	 * In this example, we append a paragraph to the file's current body content.
	 * ```javascript
	 * const file = api.currentFile();
	 * const content = await file.content.get();
	 * await file.content.set(`${content}\n\nAppended paragraph.`);
	 * ```
	 */
	set(content: string): Promise<void>;
}

/**
 * Accessed through a File's `data` property. Provides structured-data access for
 * a file: its front matter, or the full contents of a data file. Additionally,
 * you can read and write a file's fields, and add, remove, or reorder array items.
 */
export interface CloudCannonVisualEditorAPIV1FileData {
	/**
	 * Returns the file's structured data: the front matter of a content file, or
	 * the full contents of a data file (JSON, YAML, TOML). The result is an object,
	 * or an array when the file's top-level value is a list. Pass `slug` to read a single
	 * field's value instead of the whole object. Resolves to `undefined` if the
	 * file does not exist.
	 * @param options Optional `{ slug }` to read a single field.
	 * @returns A promise for the data: an object, an array, or `undefined`.
	 * @example
	 * In this example, we read the whole front matter object, then a single field by slug, and log both.
	 * ```javascript
	 * const data = await api.currentFile().data.get();
	 * const title = await api.currentFile().data.get({ slug: 'title' });
	 * console.log(data, title);
	 * ```
	 */
	get(options?: {
		/** The slug of a single field to read, instead of the whole object. */
		slug?: string;
	}): Promise<Record<string, any> | any[] | undefined>;

	/**
	 * Sets a single structured-data field. This marks the file as having unsaved
	 * changes; a Team Member must save the Site to persist it. Has no effect if
	 * the file does not exist.
	 * @param options The field `slug` and its new `value`.
	 * @returns A promise that resolves once the change is applied (with no value).
	 * @example
	 * In this example, we set the `title` field to a new value.
	 * ```javascript
	 * await api.currentFile().data.set({ slug: 'title', value: 'My Title' });
	 * ```
	 */
	set(options: SetOptions): Promise<any>;

	/**
	 * Opens the hosted Data Panel for a single field so a Team Member can edit it.
	 * The method returns immediately and does not wait for or report the result of
	 * the edit.
	 * @param options The field `slug`, with optional `style` and `position`.
	 * @example
	 * In this example, we open the Data Panel for the `title` field.
	 * ```javascript
	 * api.currentFile().data.edit({ slug: 'title' });
	 * ```
	 */
	edit(options: EditOptions): void;

	/**
	 * Uploads a file to a specific field (for example, an image or file Input) and
	 * returns the uploaded file's path. Setting the field marks the file as having
	 * unsaved changes; a Team Member must save the Site to persist it. Resolves to
	 * `undefined` if the file does not exist or the upload produces no path. For a
	 * general asset upload that is not tied to a field, use the top-level
	 * `uploadFile`.
	 * @param file The file to upload.
	 * @param options The target field `slug`.
	 * @returns A promise for the uploaded file's path, or `undefined`.
	 * @example
	 * In this example, we upload the file chosen in a file input into the `hero_image` field and read its path.
	 * ```javascript
	 * const [file] = document.querySelector('input[type="file"]').files;
	 * const path = await api.currentFile().data.upload(file, { slug: 'hero_image' });
	 * ```
	 */
	upload(file: File, options: { slug: string }): Promise<string | undefined>;

	/**
	 * Adds an item to an array field. This marks the file as having unsaved
	 * changes; a Team Member must save the Site to persist it. Has no effect if
	 * the file does not exist.
	 * @param options The field `slug`, the `index` to insert at (`null` to append),
	 * and the `value`.
	 * @returns A promise that resolves once the item is added.
	 * @example
	 * In this example, we append a new item to the `items` array field.
	 * ```javascript
	 * await api.currentFile().data.addArrayItem({
	 *   slug: 'items',
	 *   index: null,
	 *   value: { title: 'New item' },
	 * });
	 * ```
	 */
	addArrayItem(options: AddArrayItemOptions): Promise<void>;

	/**
	 * Removes an item from an array field by index. This marks the file as having
	 * unsaved changes; a Team Member must save the Site to persist it. Has no
	 * effect if the file does not exist.
	 * @param options The field `slug` and the `index` to remove.
	 * @returns A promise that resolves once the item is removed.
	 * @example
	 * In this example, we remove the item at index 1 from the `items` array field.
	 * ```javascript
	 * await api.currentFile().data.removeArrayItem({ slug: 'items', index: 1 });
	 * ```
	 */
	removeArrayItem(options: RemoveArrayItemOptions): Promise<void>;

	/**
	 * Moves an item within an array field, or between two array fields when
	 * `toSlug` differs from `fromSlug`. This marks the file as having unsaved
	 * changes; a Team Member must save the Site to persist it. Has no effect if
	 * the file does not exist.
	 * @param options `fromSlug` and `fromIndex` for the source, and `toIndex`
	 * (with optional `toSlug`) for the destination.
	 * @returns A promise that resolves once the item is moved.
	 * @example
	 * In this example, we move an item from index 1 to index 2 within the `items` array field.
	 * ```javascript
	 * await api.currentFile().data.moveArrayItem({
	 *   fromSlug: 'items',
	 *   fromIndex: 1,
	 *   toIndex: 2,
	 * });
	 * ```
	 */
	moveArrayItem(options: MoveArrayItemOptions): Promise<void>;
}

/**
 * Represents a single file in your Site. Returned by the
 * `currentFile()`, `file()`, and `files()` methods, and by a Collection's or
 * Dataset's `items()` method. Additionally, you can read and write a File's raw source,
 * body content, and structured data, read its metadata, and lock it while you
 * edit.
 */
export interface CloudCannonVisualEditorAPIV1File {
	/**
	 * Holds the file's source path, relative to the Site root.
	 * @example
	 * In this example, we read a file's source path and log it.
	 * ```javascript
	 * const path = api.currentFile().path;
	 * console.log(path);
	 * ```
	 */
	path: string;

	/**
	 * Provides structured-data access for the file (front matter, or a data file's
	 * contents). Use the methods on the FileData object to read and write the data.
	 * @example
	 * In this example, we get the FileData object for the file open in the editor.
	 * ```javascript
	 * const data = api.currentFile().data;
	 * ```
	 */
	data: CloudCannonVisualEditorAPIV1FileData;

	/**
	 * Provides body-content access for the file (everything after the front matter).
	 * Use the methods on the FileContent object to read and write the body.
	 * @example
	 * In this example, we get the FileContent object for the file open in the editor.
	 * ```javascript
	 * const content = api.currentFile().content;
	 * ```
	 */
	content: CloudCannonVisualEditorAPIV1FileContent;

	/**
	 * Returns the file's entire raw source (front matter and body) as a string.
	 * Use `content.get()` for the body alone, or `data.get()` for the parsed front
	 * matter. Resolves to `undefined` if the file does not exist.
	 * @returns A promise for the raw source string.
	 * @example
	 * In this example, we read the raw source of the file open in the editor and log it.
	 * ```javascript
	 * const raw = await api.currentFile().get();
	 * console.log(raw);
	 * ```
	 */
	get(): Promise<string | undefined>;

	/**
	 * Replaces the file's entire raw source with the given string. Use this for
	 * files that aren't edited through structured data, such as a
	 * `robots.txt`. This marks the file as having unsaved changes; a Team Member
	 * must save the Site to persist it. Has no effect if the file does not exist.
	 * @param value The new raw source, as a string.
	 * @returns A promise that resolves once the change is applied.
	 * @example
	 * In this example, we read a file's raw source, replace some text, and write it back.
	 * ```javascript
	 * const file = api.file('/public/robots.txt');
	 * const raw = await file.get();
	 * await file.set(raw.replace('old text', 'new text'));
	 * ```
	 */
	set(value: string): Promise<void>;

	/**
	 * Returns the file's metadata: `{ file_size, created_at, last_modified, data }`,
	 * where `data` is the file's resolved output data (its front matter merged with
	 * the data CloudCannon's build produces for it), not the same as the File's
	 * `data` object. Metadata is read-only and cannot be written through the API.
	 * Resolves to `undefined` if the file does not exist.
	 * @returns A promise for the file's metadata.
	 * @example
	 * In this example, we read the metadata of the file open in the editor and log it.
	 * ```javascript
	 * const meta = await api.currentFile().metadata();
	 * console.log(meta);
	 * ```
	 */
	metadata(): Promise<FileMetadata | undefined>;

	// Not yet implemented: delete(), move(), duplicate().

	/**
	 * Claims an editing lock on the file so other Team Members cannot change it
	 * while your integration writes to it. Resolves to `{ readOnly }`. When
	 * `readOnly` is `true`, another Team Member already holds the lock for that
	 * file and your integration should not write. Resolves to `undefined` if the
	 * file does not exist. Release the lock with `releaseLock()` when you are done.
	 * @returns A promise for the lock status, `{ readOnly: boolean }`.
	 * @example
	 * In this example, we claim the lock on the file we're editing, write a field only if no one else holds it, then release it.
	 * ```javascript
	 * const file = api.currentFile();
	 * const { readOnly } = await file.claimLock();
	 * if (!readOnly) {
	 *   await file.data.set({ slug: 'status', value: 'in-progress' });
	 *   await file.releaseLock();
	 * }
	 * ```
	 */
	claimLock(): Promise<{ readOnly: boolean } | undefined>;

	/**
	 * Releases a lock claimed with `claimLock()`, letting other Team Members edit
	 * the file again. Resolves to `undefined` if the file does not exist.
	 * @returns A promise for the lock status, `{ readOnly: boolean }`.
	 * @example
	 * In this example, we release a lock on the file we're editing.
	 * ```javascript
	 * await api.currentFile().releaseLock();
	 * ```
	 */
	releaseLock(): Promise<{ readOnly: boolean } | undefined>;

	/**
	 * Listens for `change` and `delete` events on the file. `change` fires when
	 * the file is created or updated, and `delete` when it is removed. Remove the
	 * listener with `removeEventListener` when your integration is torn down.
	 * @example
	 * In this example, we log messages when the file changes or is deleted.
	 * ```javascript
	 * const file = api.currentFile();
	 * file.addEventListener('change', () => console.log('Changed'));
	 * file.addEventListener('delete', () => console.log('Deleted'));
	 * ```
	 */
	addEventListener(
		event: 'change' | 'delete',
		listener: EditEventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	/**
	 * Removes a `change` or `delete` listener previously added with `addEventListener`.
	 * @example
	 * In this example, we stop listening for changes to the file on teardown.
	 * ```javascript
	 * const file = api.currentFile();
	 * const onChange = () => console.log('Changed');
	 * file.addEventListener('change', onChange);
	 * file.removeEventListener('change', onChange);
	 * ```
	 */
	removeEventListener(
		event: 'change' | 'delete',
		listener: EditEventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;

	/**
	 * Returns the resolved Input configuration for a field, or `undefined` when the
	 * field has no configuration (or the file does not exist).
	 * @returns A promise for the field's Input configuration.
	 * @example
	 * In this example, we read the resolved Input configuration for the `hero_image` field and log it.
	 * ```javascript
	 * const config = await api.currentFile().getInputConfig({ slug: 'hero_image' });
	 * console.log(config);
	 * ```
	 */
	getInputConfig(options: GetInputConfigOptions): Promise<Input | undefined>;
}

/**
 * Represents a Collection of files, as configured under `collections_config` in
 * your CloudCannon Configuration File. Returned by the `collection()` and
 * `collections()` methods. Additionally, you can call `items()` to list a
 * Collection's files, or `addEventListener` to react to changes.
 */
export interface CloudCannonVisualEditorAPIV1Collection {
	/**
	 * Holds the Collection's key, as configured under `collections_config` in
	 * your CloudCannon Configuration File.
	 * @example
	 * In this example, we read a Collection's key from its handle.
	 * ```javascript
	 * const collection = api.collection('posts');
	 * const key = collection.collectionKey; // 'posts'
	 * ```
	 */
	collectionKey: string;

	/**
	 * Returns every file in the Collection as an array of File objects. A
	 * non-matching key (a valid string that matches no configured Collection)
	 * resolves to an empty array. A falsy key (an empty string or `undefined`)
	 * never resolves the returned promise, so always pass a real Collection key.
	 * A Dataset differs here: its `items()` never resolves for a non-matching key.
	 * @returns A promise for the Collection's files.
	 * @example
	 * In this example, we list every file in the `posts` Collection and log each path.
	 * ```javascript
	 * const posts = await api.collection('posts').items();
	 * for (const file of posts) {
	 *   console.log(file.path);
	 * }
	 * ```
	 */
	items(): Promise<CloudCannonVisualEditorAPIV1File[]>;

	// Not yet implemented: add().

	/**
	 * Listens for `change` and `delete` events on any file in this Collection.
	 * `change` fires when a file is created or updated, and `delete` when one is
	 * removed. Remove the listener with `removeEventListener` when your integration
	 * is torn down.
	 * @example
	 * In this example, we log the path of any post that changes.
	 * ```javascript
	 * api.collection('posts').addEventListener('change', (event) => {
	 *   console.log('A post changed:', event.detail.sourcePath);
	 * });
	 * ```
	 */
	addEventListener(
		event: 'change' | 'delete',
		listener: EditEventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	/**
	 * Removes a `change` or `delete` listener previously added with `addEventListener`.
	 * @example
	 * In this example, we stop listening for changes to posts on teardown.
	 * ```javascript
	 * const posts = api.collection('posts');
	 * const onChange = (event) => console.log('A post changed:', event.detail.sourcePath);
	 * posts.addEventListener('change', onChange);
	 * posts.removeEventListener('change', onChange);
	 * ```
	 */
	removeEventListener(
		event: 'change' | 'delete',
		listener: EditEventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

/**
 * Represents a Dataset, as configured under `data_config` in your CloudCannon
 * Configuration File. Returned by the `dataset()` method. Additionally, you can
 * call `items()` to read a Dataset's file or files, or `addEventListener` to
 * react to changes.
 */
export interface CloudCannonVisualEditorAPIV1Dataset {
	/**
	 * Holds the Dataset's key, as configured under `data_config` in your
	 * CloudCannon Configuration File.
	 * @example
	 * In this example, we read a Dataset's key from its handle.
	 * ```javascript
	 * const dataset = api.dataset('locales');
	 * const key = dataset.datasetKey; // 'locales'
	 * ```
	 */
	datasetKey: string;

	/**
	 * Returns the Dataset's file or files: a single File when the Dataset is
	 * configured as one file, or an array of File objects when it's a folder.
	 * A falsy key (an empty string or `undefined`) or a non-matching key (a valid
	 * string that matches no configured Dataset) never resolves the returned
	 * promise, so always pass a real Dataset key. A Collection differs here: its
	 * `items()` resolves to an empty array for a non-matching key.
	 * @returns A promise for the Dataset's file, or array of files.
	 * @example
	 * In this example, we read the `locales` Dataset's file or files, normalized to an array.
	 * ```javascript
	 * const result = await api.dataset('locales').items();
	 * const items = Array.isArray(result) ? result : [result];
	 * for (const file of items) {
	 *   console.log(file.path);
	 * }
	 * ```
	 */
	items(): Promise<CloudCannonVisualEditorAPIV1File[] | CloudCannonVisualEditorAPIV1File>;

	/**
	 * Listens for `change` and `delete` events on any file in this Dataset.
	 * `change` fires when a file is created or updated, and `delete` when one is
	 * removed. Remove the listener with `removeEventListener` when your integration
	 * is torn down.
	 * @example
	 * In this example, we log the path of any locale that changes.
	 * ```javascript
	 * api.dataset('locales').addEventListener('change', (event) => {
	 *   console.log('A locale changed:', event.detail.sourcePath);
	 * });
	 * ```
	 */
	addEventListener(
		event: 'change' | 'delete',
		listener: EditEventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	/**
	 * Removes a `change` or `delete` listener previously added with `addEventListener`.
	 * @example
	 * In this example, we stop listening for changes to locales on teardown.
	 * ```javascript
	 * const locales = api.dataset('locales');
	 * const onChange = (event) => console.log('A locale changed:', event.detail.sourcePath);
	 * locales.addEventListener('change', onChange);
	 * locales.removeEventListener('change', onChange);
	 * ```
	 */
	removeEventListener(
		event: 'change' | 'delete',
		listener: EditEventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

/**
 * Represents an editable region in the page preview. Returned by
 * the `createTextEditableRegion()` method. Additionally, you can call
 * `setContent` to update the region's content programmatically.
 */
export interface CloudCannonVisualEditorAPIV1TextEditableRegion {
	/**
	 * Replaces the editable region's content programmatically.
	 * @param content The new content. Pass `null` or omit to clear it.
	 * @example
	 * In this example, we mount an editable region, then set its content programmatically.
	 * ```javascript
	 * const region = await api.createTextEditableRegion(element, onChange);
	 * region.setContent('<p>New content</p>');
	 * ```
	 */
	setContent: (content?: string | null) => void;
}

export interface CloudCannonVisualEditorAPIV1 {
	/**
	 * Returns the files CloudCannon has prefetched for the current editing
	 * session, as a map of source path to `Blob`.
	 * @returns A promise for the prefetched files.
	 * @example
	 * In this example, we read the files CloudCannon prefetched for this session.
	 * ```javascript
	 * const files = await api.prefetchedFiles();
	 * ```
	 */
	prefetchedFiles(): Promise<Record<string, Blob>>;

	/**
	 * Shows or hides the Visual Editor's loading overlay. Pass a message to show
	 * the overlay while your integration performs async setup, or `undefined` to
	 * clear it.
	 * @param loadingData The message to show, or `undefined` to hide the overlay.
	 * @returns A promise that resolves once the loading state is applied.
	 * @example
	 * In this example, we show the loading overlay during async work, then clear it.
	 * ```javascript
	 * await api.setLoading('Loading data…');
	 * // …async work…
	 * await api.setLoading(undefined);
	 * ```
	 */
	setLoading(loadingData: string | undefined): Promise<void>;

	/**
	 * Uploads a file through CloudCannon's asset handling and returns its path.
	 * Pass `undefined` as the second argument for default behavior, or an Input
	 * configuration to control where the file is uploaded and which asset sources
	 * or DAMs are offered. To upload into a specific field, use `file.data.upload`
	 * instead. Resolves to `undefined` if the upload produces no path.
	 * @param file The file to upload.
	 * @param inputConfig Optional Input configuration, or `undefined` for defaults.
	 * @returns A promise for the uploaded file's path, or `undefined`.
	 * @example
	 * In this example, we upload an image with default asset handling.
	 * ```javascript
	 * const path = await api.uploadFile(new File([blob], 'image.png'), undefined);
	 * ```
	 */
	uploadFile(
		file: File,
		inputConfig: RichTextInput | UrlInput | FileInput | undefined
	): Promise<string | undefined>;

	/**
	 * Returns the file currently open in the Visual Editor. Not every page has an
	 * associated file, and this throws when the open page has none.
	 * @returns The file open in the preview.
	 * @throws {Error} `'No current file path'` when no file is open.
	 * @example
	 * In this example, we read the open file, wrapping the call in a `try`/`catch`
	 * to handle a page with no associated file.
	 * ```javascript
	 * try {
	 *   const file = api.currentFile();
	 * } catch (err) {
	 *   // The open page has no associated file.
	 * }
	 * ```
	 */
	currentFile(): CloudCannonVisualEditorAPIV1File;
	/**
	 * Returns the file at a source path, relative to the Site root, regardless of
	 * which page is open. This never throws; calling a method on a file whose path
	 * doesn't exist resolves to `undefined`.
	 * @param path The file's source path (for example, `/content/pages/about.md`).
	 * @returns The file at that path.
	 * @example
	 * In this example, we reference a file by its source path.
	 * ```javascript
	 * const about = api.file('/content/pages/about.md');
	 * ```
	 */
	file(path: string): CloudCannonVisualEditorAPIV1File;
	/**
	 * Returns a Collection object for the given key, as configured under
	 * `collections_config` in your CloudCannon Configuration File. The object
	 * provides methods to list the Collection's items and listen for changes,
	 * not the items themselves.
	 * @param key The Collection key.
	 * @returns A Collection object with methods to list items and subscribe to changes.
	 * @example
	 * In this example, we reference the `posts` Collection by key.
	 * ```javascript
	 * const posts = api.collection('posts');
	 * ```
	 */
	collection(key: string): CloudCannonVisualEditorAPIV1Collection;
	/**
	 * Returns the Dataset with the given key, as configured under `data_config` in
	 * your CloudCannon Configuration File.
	 * @param key The Dataset key.
	 * @returns The Dataset.
	 * @example
	 * In this example, we reference the `locales` Dataset by key.
	 * ```javascript
	 * const locales = api.dataset('locales');
	 * ```
	 */
	dataset(key: string): CloudCannonVisualEditorAPIV1Dataset;
	/**
	 * Returns every file in the Site as an array of File objects.
	 * @returns A promise for all files.
	 * @example
	 * In this example, we list every file in the Site and log each path.
	 * ```javascript
	 * const files = await api.files();
	 * for (const file of files) console.log(file.path);
	 * ```
	 */
	files(): Promise<CloudCannonVisualEditorAPIV1File[]>;
	/**
	 * Returns every configured Collection in the Site as an array of Collection
	 * objects.
	 * @returns A promise for all Collections.
	 * @example
	 * In this example, we list every Collection in the Site and log each key.
	 * ```javascript
	 * const collections = await api.collections();
	 * for (const collection of collections) console.log(collection.collectionKey);
	 * ```
	 */
	collections(): Promise<CloudCannonVisualEditorAPIV1Collection[]>;
	/**
	 * Returns every configured Dataset in the Site as an array of Dataset
	 * objects.
	 * @returns A promise for all Datasets.
	 * @example
	 * In this example, we list every Dataset in the Site and log each key.
	 * ```javascript
	 * const datasets = await api.datasets();
	 * for (const dataset of datasets) console.log(dataset.datasetKey);
	 * ```
	 */
	datasets(): Promise<CloudCannonVisualEditorAPIV1Dataset[]>;
	/**
	 * Listens for `change` and `delete` events across the entire Site. `change`
	 * fires when any file is created or updated, and `delete` when any file is
	 * removed. Remove the listener with `removeEventListener` when your integration
	 * is torn down.
	 * @example
	 * In this example, we log the path of any file that changes anywhere in the Site.
	 * ```javascript
	 * api.addEventListener('change', (event) => {
	 *   console.log('Changed:', event.detail.sourcePath);
	 * });
	 * ```
	 */
	addEventListener(
		event: 'change' | 'delete',
		listener: EditEventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	/**
	 * Removes a `change` or `delete` listener previously added with `addEventListener`.
	 * @example
	 * In this example, we stop listening for Site-wide changes on teardown.
	 * ```javascript
	 * const onChange = (event) => console.log('Changed:', event.detail.sourcePath);
	 * api.addEventListener('change', onChange);
	 * api.removeEventListener('change', onChange);
	 * ```
	 */
	removeEventListener(
		event: 'change' | 'delete',
		listener: EditEventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;

	/**
	 * Type guard that returns `true` when `obj` is a File object.
	 * @param obj The value to check.
	 * @example
	 * In this example, we narrow an unknown value to a File before using it.
	 * ```javascript
	 * if (api.isAPIFile(obj)) {
	 *   const data = await obj.data.get();
	 * }
	 * ```
	 */
	isAPIFile(obj: unknown): obj is CloudCannonVisualEditorAPIV1File;
	/**
	 * Type guard that returns `true` when `obj` is a Collection object.
	 * @param obj The value to check.
	 * @example
	 * In this example, we narrow an unknown value to a Collection before using it.
	 * ```javascript
	 * if (api.isAPICollection(obj)) {
	 *   const items = await obj.items();
	 * }
	 * ```
	 */
	isAPICollection(obj: unknown): obj is CloudCannonVisualEditorAPIV1Collection;
	/**
	 * Type guard that returns `true` when `obj` is a Dataset object.
	 * @param obj The value to check.
	 * @example
	 * In this example, we narrow an unknown value to a Dataset before using it.
	 * ```javascript
	 * if (api.isAPIDataset(obj)) {
	 *   const items = await obj.items();
	 * }
	 * ```
	 */
	isAPIDataset(obj: unknown): obj is CloudCannonVisualEditorAPIV1Dataset;
	/**
	 * Finds the Structure value whose conditions match a given data object, the
	 * same way CloudCannon picks a Structure entry for a value.
	 * @param structure The Structure to search.
	 * @param value The data object to match against the Structure's values.
	 * @returns The matching Structure value, or `undefined` if none match.
	 * @example
	 * In this example, we find the Structure value that matches a data object.
	 * ```javascript
	 * const match = api.findStructure(structure, { type: 'hero' });
	 * ```
	 */
	findStructure(structure: Structure, value: any): StructureValue | undefined;
	/**
	 * Returns the Input type CloudCannon would use for a field (such as `text`,
	 * `image`, or `select`), based on its key, value, and any Input configuration.
	 * @param key The field key.
	 * @param value The field value.
	 * @param inputConfig Optional Input configuration for the field.
	 * @returns The resolved Input type.
	 * @example
	 * In this example, we resolve the Input type CloudCannon would use for a field.
	 * ```javascript
	 * const type = api.getInputType('hero_image', '/img.png');
	 * ```
	 */
	getInputType(key: string | undefined, value?: unknown, inputConfig?: Input): InputType;

	/**
	 * Makes a supported HTML element directly editable in the Visual Editor page
	 * preview. Clicking the element opens a rich text toolbar and edits its content
	 * in place. Returns a region object whose `setContent` updates the content
	 * programmatically.
	 * @param element The element to make editable.
	 * @param onChange Called with the updated content whenever it changes.
	 * @param options Optional configuration for the editable region.
	 * @returns A promise for the editable region.
	 * @throws {Error} `'Parent window not yet initialized'` when called before the editor is ready.
	 * @example
	 * In this example, we make a heading element editable in the page preview.
	 * ```javascript
	 * const region = await api.createTextEditableRegion(
	 *   document.querySelector('#hero-heading'),
	 *   (content) => console.log('Updated:', content),
	 * );
	 * ```
	 */
	createTextEditableRegion(
		element: HTMLElement,
		onChange: (content?: string | null) => void,
		options?: {
			/**
			 * The family of HTML element being edited: `text`, `block`, `span`,
			 * `image`, or `link`. Inferred from the tag name if omitted (for
			 * example, `h2` as `text`, `div` as `block`).
			 */
			elementType?: string;
			/**
			 * The editing mode. Use the same value as `elementType`, or `content`
			 * when editing body content.
			 */
			editableType?: string;
			/** Controls which rich text toolbar options are available. */
			inputConfig?: RichTextInput;
			/**
			 * The file extension used when saving the edited fragment (for example,
			 * `.html` or `.md`). Match it to the format of the underlying file.
			 */
			extension?: string;
		}
	): Promise<CloudCannonVisualEditorAPIV1TextEditableRegion>;

	/**
	 * Opens a custom Data Panel in the Visual Editor and resolves with the
	 * panel's id. When `options.id` is omitted, CloudCannon generates a
	 * seven-character base-36 id. Pass the returned id to
	 * `destroyCustomDataPanel` to close the panel.
	 * @param options Configuration for the panel and its Inputs.
	 * @returns A promise for the panel's id.
	 * @example
	 * In this example, we open a custom Data Panel and log its data whenever it changes.
	 * ```javascript
	 * const panelId = await api.createCustomDataPanel({
	 *   title: 'Image SEO',
	 *   onChange: (data) => console.log(data),
	 * });
	 * ```
	 */
	createCustomDataPanel(options: CreateCustomDataPanelOptions): Promise<string>;
	/**
	 * Closes the custom Data Panel with the given id.
	 * @param id The id returned by `createCustomDataPanel`.
	 * @returns A promise that resolves once the panel is closed.
	 * @example
	 * In this example, we close a custom Data Panel by its id.
	 * ```javascript
	 * await api.destroyCustomDataPanel(panelId);
	 * ```
	 */
	destroyCustomDataPanel(id: string): Promise<void>;

	/**
	 * Returns a URL that works inside the Visual Editor for a file that may not yet
	 * be committed to the Site, such as an image uploaded in the current editing
	 * session. Use this instead of the source path when displaying media.
	 * @param originalUrl The source path to rewrite.
	 * @param inputConfig Optional Input configuration.
	 * @returns A promise for a preview URL.
	 * @throws {Error} `'Parent window not yet initialized'` when called before the editor is ready.
	 * @example
	 * In this example, we read a preview URL for an image that may not be committed yet.
	 * ```javascript
	 * const url = await api.getPreviewUrl('/images/hero.jpg');
	 * ```
	 */
	getPreviewUrl(originalUrl: string, inputConfig?: Input): Promise<string>;
}

export type CloudCannonVisualEditorAPIVersions = 'v0' | 'v1';

/**
 * The `detail` of the `cloudcannon:load` event, and the shape mixed into
 * `window`: the API router on `CloudCannonAPI`, plus the v0 handler on
 * `CloudCannon` for backwards compatibility.
 */
export interface CloudCannonVisualEditorAPIEventDetails {
	CloudCannonAPI?: CloudCannonVisualEditorAPIRouter;
	CloudCannon?: CloudCannonVisualEditorAPIV0 | CloudCannonVisualEditorAPIV1;
}

/**
 * A `Window` augmented with CloudCannon's globals. Declare `window` as this type
 * in modules that talk to the API to get typed access to `CloudCannonAPI`.
 */
export interface CloudCannonVisualEditorWindow
	extends Window,
		CloudCannonVisualEditorAPIEventDetails {}

/**
 * The router exposed on `window.CloudCannonAPI`. Call `useVersion` to get a
 * versioned API object.
 */
export interface CloudCannonVisualEditorAPIRouter {
	/**
	 * Returns the v0 API handler.
	 * @deprecated Use `useVersion('v1', true)` instead.
	 * @param key The API version, `'v0'`.
	 * @param preventGlobalInstall When `true`, the handler is not assigned to
	 * `window.CloudCannon`.
	 */
	useVersion(key: 'v0', preventGlobalInstall?: boolean): CloudCannonVisualEditorAPIV0;
	/**
	 * Returns the v1 API object used to interact with the Visual Editor.
	 * @param key The API version, `'v1'`.
	 * @param preventGlobalInstall When `true`, the handler is not assigned to
	 * `window.CloudCannon`. Pass `true` to avoid version conflicts with other
	 * integrations (such as Bookshop).
	 * @returns The v1 API object.
	 * @example
	 * In this example, we obtain the v1 API object without installing it on the global window.
	 * ```javascript
	 * const api = window.CloudCannonAPI.useVersion('v1', true);
	 * ```
	 */
	useVersion(key: 'v1', preventGlobalInstall?: boolean): CloudCannonVisualEditorAPIV1;
}
