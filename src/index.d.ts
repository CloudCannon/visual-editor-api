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

export interface CreateCustomDataPanelOptions {
	id?: string;
	title: string;
	onChange: (data?: Record<string, unknown> | unknown[]) => void;
	data?: Record<string, unknown> | unknown[];
	config?: Cascade;
	position?: DOMRect;
	allowFullDataCascade?: boolean;
}

type EventListenerParameters = Parameters<EventTarget['addEventListener']>;
type EventListenerOrEventListenerObject = EventListenerParameters[1];
type EventListenerOptions = EventListenerParameters[2];

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
 * Options for setting data in the v2 API
 */
export interface SetOptions {
	/** The identifier of the field to set */
	slug: string;
	/** The value to set */
	value: any;
}

/**
 * Options for editing a field in the v2 API
 */
export interface EditOptions {
	/** The identifier of the field to edit */
	slug: string;
	/** Optional style information */
	style?: string | null;
	/** The coordinates of the edit, and the bounding rectangle of the element being edited */
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
 * Options for array operations in the v2 API
 */
export interface ArrayOptions {
	/** The identifier of the array field */
	slug: string;
}

/**
 * Options for adding an array item in the v2 API
 */
export interface AddArrayItemOptions extends ArrayOptions {
	/** The position to insert at (null for end) */
	index: number | null;
	/** The value to insert */
	value: any;
	/** The index to clone from if value isnt provided */
	sourceIndex?: number;
}

/**
 * Options for moving an array item in the v2 API
 */
export interface MoveArrayItemOptions {
	/** the identifier of the array field to move from */
	fromSlug: string;
	/** the identifier of the array field to move to, defaults to fromSlug if not provided */
	toSlug?: string;
	/** The current index of the item */
	fromIndex: number;
	/** The target index for the item */
	toIndex: number;
}

/**
 * Options for moving an array item in the v2 API
 */
export interface RemoveArrayItemOptions extends ArrayOptions {
	/** The current index of the item */
	index: number;
}

export interface GetInputConfigOptions {
	slug: string;
}

export interface FileMetadata {
	file_size: number | null;
	created_at: string | null;
	last_modified: string | Date | null;
	data: any;
}

export interface CloudCannonVisualEditorAPIV1FileContent {
	/**
	 * Gets the body content of a file. This is the content of the file without the front matter as a string.
	 * @param options - Optional configuration for the value retrieval
	 * @returns Promise that resolves with the body content of the file
	 * @throws {FileNotFoundError} If the file is not found
	 * @example
	 * ```javascript
	 * const value = await CloudCannon.content();
	 * ```
	 */
	get(): Promise<string>;

	/**
	 * Sets the body content of a file
	 * @param options - Configuration options for setting body content
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves when the body content is set
	 */
	set(content: string): Promise<void>;

	addEventListener(
		event: 'change',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	removeEventListener(
		event: 'change',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

export interface CloudCannonVisualEditorAPIV1FileData {
	/**
	 * Gets the data of a file. This will be a JSON object. This is either the data from the file or the data from front matter.
	 * @param options - Optional configuration for the value retrieval
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves with the data of the file
	 * @example
	 * ```javascript
	 * const value = await CloudCannon.data();
	 * ```
	 */
	get(options?: { slug?: string }): Promise<Record<string, any> | any[] | undefined>;

	/**
	 * Sets data for a specific field
	 * @param options - Configuration options for setting data
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves when the data is set
	 * @example
	 * ```javascript
	 * await CloudCannon.set({
	 *   slug: 'title',
	 *   value: 'My Title',
	 * });
	 * ```
	 */
	set(options: SetOptions): Promise<any>;

	/**
	 * Initiates editing of a specific field. This will open a data panel for the field.
	 * @param options - Configuration options for editing
	 * @throws {FileNotFoundError} If the file is not found
	 * @example
	 * ```javascript
	 * CloudCannon.edit({
	 *   slug: 'title',
	 *   style: 'panel',
	 *   e: event,
	 * });
	 * ```
	 */
	edit(options: EditOptions): void;

	/**
	 * Uploads a file to an input
	 */
	upload(file: File, options: EditOptions): Promise<string | undefined>;

	/**
	 * Adds an item to an array field
	 * @param options - Configuration options for adding an array item
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves when the item is added
	 * @example
	 * ```javascript
	 * await CloudCannon.addArrayItem({
	 *   slug: 'items',
	 *   value: { title: 'New Item' },
	 *   e: event,
	 * });
	 * ```
	 */
	addArrayItem(options: AddArrayItemOptions): Promise<void>;

	/**
	 * Removes an item from an array field
	 * @param options - Configuration options for removing an array item
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves when the item is removed
	 * @example
	 * ```javascript
	 * await CloudCannon.removeArrayItem({
	 *   slug: 'items',
	 *   index: 1,
	 * });
	 * ```
	 */
	removeArrayItem(options: RemoveArrayItemOptions): Promise<void>;

	/**
	 * Moves an item within an array field
	 * @param options - Configuration options for moving an array item
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves when the item is moved
	 * @example
	 * ```javascript
	 * await CloudCannon.moveArrayItem({
	 *   slug: 'items',
	 *   index: 1,
	 *   toIndex: 2,
	 * });
	 * ```
	 */
	moveArrayItem(options: MoveArrayItemOptions): Promise<void>;

	addEventListener(
		event: 'change',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	removeEventListener(
		event: 'change',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

export interface CloudCannonVisualEditorAPIV1File {
	/**
	 * The path of the file
	 */
	path: string;

	/**
	 * The data of the file
	 */
	data: CloudCannonVisualEditorAPIV1FileData;

	/**
	 * The content of the file
	 */
	content: CloudCannonVisualEditorAPIV1FileContent;

	/**
	 * Gets the body content of a file
	 * @returns Promise that resolves with the body content of the file
	 * @throws {FileNotFoundError} If the file is not found
	 */
	get(): Promise<string>;

	/**
	 * Sets the raw content of a file
	 * @param value - The raw content to set
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves when the raw content is set
	 */
	set(value: string): Promise<void>;

	/**
	 * Gets the metadata of a file
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves with the metadata of the file
	 */
	metadata(): Promise<FileMetadata | undefined>;

	// /**
	//  * Deletes a file
	//  * @throws {FileNotFoundError} If the file is not found
	//  * @returns Promise that resolves when the file is deleted
	//  */
	// delete(): Promise<void>;

	// /**
	//  * Moves a file
	//  * @param options - Configuration options for moving the file
	//  * @throws {FileNotFoundError} If the file is not found
	//  * @returns Promise that resolves when the file is moved
	//  */
	// move(options: any): Promise<CloudCannonVisualEditorAPIV1File>;

	// /**
	//  * Copies a file
	//  * @param options - Configuration options for copying the file
	//  * @throws {FileNotFoundError} If the file is not found
	//  * @returns Promise that resolves when the file is copied
	//  */
	// duplicate(options: any): Promise<CloudCannonVisualEditorAPIV1File>;

	/**
	 * Claims a lock on a file
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves with the lock status
	 */
	claimLock(): Promise<{ readOnly: boolean }>;

	/**
	 * Releases a lock on a file
	 * @throws {FileNotFoundError} If the file is not found
	 * @returns Promise that resolves with the lock status
	 */
	releaseLock(): Promise<{ readOnly: boolean }>;

	addEventListener(
		event: 'change' | 'delete',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	removeEventListener(
		event: 'change' | 'delete',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;

	getInputConfig(options: GetInputConfigOptions): Promise<Input | undefined>;
}

export interface CloudCannonVisualEditorAPIV1Collection {
	/**
	 * The key of the collection
	 */
	collectionKey: string;

	/**
	 * Gets the items in a collection
	 * @throws {CollectionNotFoundError} If the collection is not found
	 * @returns Promise that resolves with the items in the collection
	 */
	items(): Promise<CloudCannonVisualEditorAPIV1File[]>;

	// /**
	//  * Adds an item to a collection or triggers an add modal if the provided items are not available.
	//  * @param options - Configuration options for adding an item to a collection
	//  * @throws {CollectionNotFoundError} If the collection is not found
	//  * @returns Promise that resolves with the added item
	//  */
	// add(options: any): Promise<CloudCannonVisualEditorAPIV1File>;

	addEventListener(
		event: 'change' | 'delete',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	removeEventListener(
		event: 'change' | 'delete',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

export interface CloudCannonVisualEditorAPIV1Dataset {
	/**
	 * The key of the dataset
	 */
	datasetKey: string;

	/**
	 * Gets the items in a dataset
	 * @returns Promise that resolves with the items in the collection
	 */
	items(): Promise<CloudCannonVisualEditorAPIV1File[] | CloudCannonVisualEditorAPIV1File>;

	addEventListener(
		event: 'change' | 'delete',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	removeEventListener(
		event: 'change' | 'delete',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
}

export interface CloudCannonVisualEditorAPIV1TextEditableRegion {
	setContent: (content?: string | null) => void;
}

export interface CloudCannonVisualEditorAPIV1 {
	/**
	 * Gets prefetched files
	 * @returns Promise that resolves with a record of file blobs
	 */
	prefetchedFiles(): Promise<Record<string, Blob>>;

	/**
	 * Sets the loading state of the editor
	 * @param loadingData - Optional loading state message
	 * @returns Promise that resolves when loading state is updated
	 */
	setLoading(loadingData: string | undefined): Promise<void>;

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

	currentFile(): CloudCannonVisualEditorAPIV1File;
	file(path: string): CloudCannonVisualEditorAPIV1File;
	collection(key: string): CloudCannonVisualEditorAPIV1Collection;
	dataset(key: string): CloudCannonVisualEditorAPIV1Dataset;
	files(): Promise<CloudCannonVisualEditorAPIV1File[]>;
	collections(): Promise<CloudCannonVisualEditorAPIV1Collection[]>;

	addEventListener(
		event: 'change' | 'delete',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;
	removeEventListener(
		event: 'change' | 'delete',
		listener: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean
	): void;

	isAPIFile(obj: unknown): obj is CloudCannonVisualEditorAPIV1File;
	isAPICollection(obj: unknown): obj is CloudCannonVisualEditorAPIV1Collection;
	isAPIDataset(obj: unknown): obj is CloudCannonVisualEditorAPIV1Dataset;
	findStructure(structure: Structure, value: any): StructureValue | undefined;
	getInputType(key: string | undefined, value?: unknown, inputConfig?: Input): InputType;

	createTextEditableRegion(
		element: HTMLElement,
		onChange: (content?: string | null) => void,
		options?: {
			elementType?: string;
			editableType?: string;
			inputConfig?: RichTextInput;
			extension?: string;
		}
	): Promise<CloudCannonVisualEditorAPIV1TextEditableRegion>;

	createCustomDataPanel(options: CreateCustomDataPanelOptions): Promise<string>;
	destroyCustomDataPanel(id: string): Promise<void>;

	getPreviewUrl(originalUrl: string, inputConfig?: Input): Promise<string>;
}

export type CloudCannonVisualEditorAPIVersions = 'v0' | 'v1';

export interface CloudCannonVisualEditorAPIEventDetails {
	CloudCannonAPI?: CloudCannonVisualEditorAPIRouter;
	CloudCannon?: CloudCannonVisualEditorAPIV0 | CloudCannonVisualEditorAPIV1;
}

export interface CloudCannonVisualEditorWindow
	extends Window,
		CloudCannonVisualEditorAPIEventDetails {}

export interface CloudCannonVisualEditorAPIRouter {
	useVersion(key: 'v0', preventGlobalInstall?: boolean): CloudCannonVisualEditorAPIV0;
	useVersion(key: 'v1', preventGlobalInstall?: boolean): CloudCannonVisualEditorAPIV1;
}
