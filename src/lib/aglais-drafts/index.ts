import type { DBSchema } from 'idb';

import type { SerializedComposer } from './types';

export interface DraftsDBSchema extends DBSchema {
	drafts: {
		key: string;
		value: DraftEntry;
	};
}

export interface DraftEntry {
	id: string;
	createdAt: number;
	state: SerializedComposer;
}
