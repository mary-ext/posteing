import type { DBSchema } from 'idb';

import type { SerializedComposer } from './types';

export interface DraftsDBSchema extends DBSchema {
	drafts: {
		key: string;
		value: DraftItem;
	};
}

export interface DraftItem {
	id: string;
	createdAt: number;
	state: SerializedComposer;
}
